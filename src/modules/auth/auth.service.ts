import bcrypt from 'bcrypt';
import { IsHouseHold, RegisterStatus, Prisma } from '@prisma/client';
import { AuthRepo } from './auth.repo';
import { CustomError } from '@libs/error';
import { AdminSignupInput, SignupInput, SuperAdminSignupInput } from './auth.validate';
import { createTokens } from './utils/token';
import { getImage } from '../user/utils/s3.handler';
import { withoutPasswordUser } from '@/types/user.types';

export class AuthService {
  constructor(private repo: AuthRepo) {}

  signup = async (input: SignupInput) => {
    const existingUser = await this.repo.findUserByUniqueFields({
      email: input.email,
      username: input.username,
      phoneNumber: input.contact,
    });
    if (existingUser) {
      throw new CustomError(409, '이미 사용 중인 정보입니다');
    }

    const apartment = input.apartmentAddress
      ? await this.repo.findApartmentByAddress(input.apartmentAddress)
      : input.apartmentName
        ? await this.repo.findApartmentByName(input.apartmentName)
        : null;
    if (!apartment) {
      throw new CustomError(400, '존재하지 않는 아파트입니다');
    }

    // 입주민: 명부 정보와 일치하면 자동 승인
    let rosterMatch: Awaited<ReturnType<AuthRepo['findResidentRosterMatch']>> | undefined;
    if (input.role === 'USER' && input.apartmentDong != null && input.apartmentHo != null) {
      rosterMatch = await this.repo.findResidentRosterMatch({
        aptId: apartment.id,
        dong: input.apartmentDong,
        ho: input.apartmentHo,
        name: input.name,
        phoneNumber: input.contact,
      });
    }

    const registerStatus = rosterMatch ? RegisterStatus.APPROVED : RegisterStatus.PENDING;
    const hashedPassword = await bcrypt.hash(input.password, 10); // 비밀번호 해시(서명) 저장

    const register = await this.repo.createRegister({
      register_status: registerStatus,
      aptId: apartment.id,
      username: input.username,
      phoneNumber: input.contact,
      name: input.name,
      email: input.email,
      password: hashedPassword,
      requestedRole: input.role,
      dong: input.role === 'USER' ? input.apartmentDong : undefined,
      ho: input.role === 'USER' ? input.apartmentHo : undefined,
    });

    // 자동 승인 시 User, Resident 생성 및 명부 연결
    if (rosterMatch && registerStatus === RegisterStatus.APPROVED) {
      const user = await this.repo.createUser({
        username: register.username,
        phoneNumber: register.phoneNumber,
        name: register.name,
        email: register.email,
        password: register.password,
        role: register.requestedRole,
        register_status: RegisterStatus.APPROVED,
        register: { connect: { id: register.id } },
        apartment: { connect: { id: apartment.id } },
      });
      await this.repo.createResident({
        user: { connect: { id: user.id } },
        apartment: { connect: { id: apartment.id } },
        dong: input.apartmentDong!,
        ho: input.apartmentHo!,
      });
      await this.repo.updateRosterWithUser(rosterMatch.id, user.id);
    }

    return {
      id: register.id,
      name: register.name,
      email: register.email,
      joinStatus: register.register_status,
      isActive: register.deletedAt === null && register.register_status === 'APPROVED',
      role: register.requestedRole,
    };
  };

  signupAdmin = async (input: AdminSignupInput) => {
    if (input.role !== 'ADMIN') {
      throw new CustomError(400, '관리자 회원가입 요청이 아닙니다');
    }

    const existingUser = await this.repo.findUserByUniqueFields({
      email: input.email,
      username: input.username,
      phoneNumber: input.contact,
    });

    if (existingUser) {
      throw new CustomError(409, '이미 사용 중인 정보입니다');
    }

    const existingApartment = await this.repo.findApartmentByAddress(input.apartmentAddress);
    if (existingApartment) {
      throw new CustomError(409, '이미 등록된 아파트입니다');
    }

    const existingOffice = await this.repo.findApartmentByOfficeNumber(
      input.apartmentManagementNumber,
    );
    if (existingOffice) {
      throw new CustomError(409, '이미 등록된 관리소 번호입니다');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10); // 비밀번호 해시(서명) 저장

    const apartment = await this.repo.createApartment({
      aptName: input.apartmentName,
      aptAddress: input.apartmentAddress,
      description: input.description,
      officeNumber: input.apartmentManagementNumber,
      startComplexNumber: input.startComplexNumber,
      endComplexNumber: input.endComplexNumber,
      startDongNumber: input.startDongNumber,
      endDongNumber: input.endDongNumber,
      startFloorNumber: input.startFloorNumber,
      endFloorNumber: input.endFloorNumber,
      startHoNumber: input.startHoNumber,
      endHoNumber: input.endHoNumber,
    });

    const register = await this.repo.createRegister({
      register_status: RegisterStatus.PENDING,
      aptId: apartment.id,
      username: input.username,
      phoneNumber: input.contact,
      name: input.name,
      email: input.email,
      password: hashedPassword,
      requestedRole: input.role,
    });

    return {
      id: register.id,
      name: register.name,
      email: register.email,
      joinStatus: register.register_status,
      isActive: register.deletedAt === null && register.register_status === 'APPROVED',
      role: register.requestedRole,
    };
  };

  signupSuperAdmin = async (input: SuperAdminSignupInput) => {
    if (input.role !== 'SUPER_ADMIN') {
      throw new CustomError(400, '슈퍼 관리자 회원가입 요청이 아닙니다');
    }

    const existingUser = await this.repo.findUserByUniqueFields({
      email: input.email,
      username: input.username,
      phoneNumber: input.contact,
    });

    if (existingUser) {
      throw new CustomError(409, '이미 사용 중인 정보입니다');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(input.password, salt); // 비밀번호 해시(서명) 저장

    const user = await this.repo.createUser({
      username: input.username,
      phoneNumber: input.contact,
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      register_status: RegisterStatus.APPROVED,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      joinStatus: user.register_status,
      isActive: user.deletedAt === null,
      role: user.role,
    };
  };

  login = async (username: string, password: string) => {
    const register = await this.repo.findRegisterByUsername(username);
    if (register?.register_status === 'PENDING')
      throw new CustomError(403, '회원가입이 승인되지 않은 유저입니다');

    const user = await this.repo.findUserByUsername(username);
    if (!user) throw new CustomError(404, '존재하지 않은 유저 또는 비밀번호가 일치하지 않습니다');

    const verifyPassword = await bcrypt.compare(password, user.password); // 비밀번호 해시(서명) 검증
    if (!verifyPassword)
      throw new CustomError(401, '존재하지 않은 유저 또는 비밀번호가 일치하지 않습니다');

    if (user.register_status === RegisterStatus.PENDING) {
      throw new CustomError(403, '아직 승인되지 않은 유저입니다');
    }

    if (user.deletedAt !== null) {
      throw new CustomError(403, '탈퇴한 유저입니다');
    }

    const { password: _, ...withoutPassword } = user;

    // 프로덕션 환경이고 프로필 이미지가 있는 경우 S3의 Presigned URL 발급
    if (withoutPassword.profileImg && process.env.NODE_ENV === 'production') {
      withoutPassword.profileImg = await getImage(withoutPassword.profileImg);
    }

    const { accessToken, refreshToken } = createTokens(user.id);
    return { accessToken, refreshToken, withoutPassword };
  };

  refresh = async (userId: string) => {
    const { accessToken, refreshToken } = createTokens(userId);
    return { accessToken, refreshToken };
  };

  updateAdminStatus = async (adminRegisterId: string, status: string) => {
    const register = await this.repo.findRegisterById(adminRegisterId);
    if (!register) {
      throw new CustomError(404, '존재하지 않는 관리자 회원가입 요청입니다');
    }

    if (status === 'APPROVED') {
      if (!register.aptId) {
        throw new CustomError(400, '아파트 정보가 없습니다');
      }
      await this.repo.registerApprove(adminRegisterId);
      await this.repo.aptApprove(register.aptId);
      const user = await this.repo.createUser({
        username: register.username,
        phoneNumber: register.phoneNumber,
        name: register.name,
        email: register.email,
        password: register.password,
        role: register.requestedRole,
        register_status: RegisterStatus.APPROVED,
        register: { connect: { id: register.id } },
        apartment: { connect: { id: register.aptId } },
      });
      await this.repo.createManyBoard([
        { aptId: user.aptId!, boardType: 'NOTICE' },
        { aptId: user.aptId!, boardType: 'VOTE' },
        { aptId: user.aptId!, boardType: 'COMPLAINT' },
      ]);
    } else {
      await this.repo.registerReject(adminRegisterId);
      if (register.aptId) {
        await this.repo.aptReject(register.aptId);
      }
    }
    return;
  };

  updateResidentStatus = async (residentRegisterId: string, status: string, adminId: string) => {
    const register = await this.repo.findRegisterById(residentRegisterId);
    if (!register) {
      throw new CustomError(404, '존재하지 않는 주민 회원가입 요청입니다');
    }

    if (status === 'APPROVED') {
      if (!register.aptId) {
        throw new CustomError(400, '아파트 정보가 없습니다');
      }
      if (register.dong === null || register.ho === null) {
        throw new CustomError(400, '동/호 정보가 없습니다');
      }
      await this.repo.registerApprove(residentRegisterId);
      const user = await this.repo.createUser({
        username: register.username,
        phoneNumber: register.phoneNumber,
        name: register.name,
        email: register.email,
        password: register.password,
        role: register.requestedRole,
        register_status: RegisterStatus.APPROVED,
        register: { connect: { id: register.id } },
        apartment: { connect: { id: register.aptId } },
      });
      await this.repo.createResident({
        user: { connect: { id: user.id } },
        apartment: { connect: { id: register.aptId } },
        dong: register.dong,
        ho: register.ho,
      });
      const roster = await this.repo.createRoster({
        apartment: { connect: { id: register.aptId } },
        admin: { connect: { id: adminId } },
        user: { connect: { id: user.id } },
        dong: register.dong,
        ho: register.ho,
        name: user.name,
        phoneNumber: user.phoneNumber,
        is_houseHold: IsHouseHold.MEMBER,
        is_registered: true,
        is_residence: true,
      });
    } else {
      await this.repo.registerReject(residentRegisterId);
    }
    return;
  };

  // updateAdminsStatusBatch = async (adminRegisterIds: string[], status: string) => {
  //   for (const id of adminRegisterIds) {
  //     await this.updateAdminStatus(id, status);
  //   }
  //   return;
  // };

  // updateResidentsStatusBatch = async (residentRegisterIds: string[], status: string) => {
  //   for (const id of residentRegisterIds) {
  //     await this.updateResidentStatus(id, status);
  //   }
  //   return;
  // };

  updateAdmin = async (
    adminId: string,
    adminData: Prisma.UserUpdateInput,
    aptData: Prisma.ApartmentUpdateInput,
  ) => {
    const admin = await this.repo.findUserById(adminId);
    if (!admin || admin.role !== 'ADMIN') {
      throw new CustomError(404, '존재하지 않는 관리자입니다');
    }

    //(실제로 값이 들어온 게 있는지 확인)
    const hasAdminData = Object.values(adminData).some((val) => val !== undefined);
    const hasAptData = Object.values(aptData).some((val) => val !== undefined);

    //  유니크 필드 중복 여부 체크 (adminData 업데이트가 있을 경우)
    if (hasAdminData) {
      if (adminData.email && adminData.email !== admin.email) {
        const emailExists = await this.repo.findUserByEmail(adminData.email as string);
        if (emailExists) throw new CustomError(400, '이미 사용 중인 이메일입니다.');
      }
      if (adminData.phoneNumber && adminData.phoneNumber !== admin.phoneNumber) {
        const phoneExists = await this.repo.findUserByPhoneNumber(adminData.phoneNumber as string);
        if (phoneExists) throw new CustomError(400, '이미 사용 중인 연락처입니다.');
      }
    }

    // 아파트 유니크 필드 중복 여부 체크 (aptData 업데이트가 있고, 아파트 연동이 되어있는 경우)
    if (hasAptData && admin.aptId) {
      const currentApt = await this.repo.findApartmentById(admin.aptId);

      if (aptData.aptAddress && aptData.aptAddress !== currentApt?.aptAddress) {
        const addressExists = await this.repo.findApartmentByAddress(aptData.aptAddress as string);
        if (addressExists) throw new CustomError(400, '이미 등록된 아파트 주소입니다.');
      }
      if (aptData.officeNumber && aptData.officeNumber !== currentApt?.officeNumber) {
        const officeExists = await this.repo.findApartmentByOfficeNumber(
          aptData.officeNumber as string,
        );
        if (officeExists) throw new CustomError(400, '이미 존재하는 관리 번호입니다.');
      }
    }

    if (hasAdminData) {
      await this.repo.updateAdmin(admin.id, adminData);
    }
    if (hasAptData && admin.aptId) {
      await this.repo.updateApartment(admin.aptId, aptData);
    }

    return;
  };

  deleteApartment = async (adminId: string) => {
    const admin = await this.repo.findUserById(adminId);
    if (!admin || admin.role !== 'ADMIN') {
      throw new CustomError(404, '존재하지 않는 관리자입니다');
    }
    if (admin.deletedAt !== null) {
      throw new CustomError(400, '이미 삭제된 관리자입니다');
    }
    if (!admin.aptId) {
      throw new CustomError(400, '아파트 정보가 없습니다');
    }

    const apt = await this.repo.findApartmentById(admin.aptId);
    if (apt?.deletedAt) {
      throw new CustomError(400, '이미 삭제된 아파트입니다');
    }

    const result = await this.repo.softDeleteApartmentAndUsers(admin.aptId);

    if (!result) {
      throw new CustomError(401, '관리자 정보(아파트 정보 포함) 삭제 중 오류가 발생했습니다');
    }

    return;
  };

  cleanup = async (user: withoutPasswordUser) => {
    if (user.role == 'SUPER_ADMIN') {
      const rejectedRegisters = await this.repo.findRejectedAdmin();
      if (rejectedRegisters.length === 0) {
        throw new CustomError(400, '삭제할 관리자 데이터가 없습니다');
      }

      const registerIds = rejectedRegisters.map((r) => r.id);
      const aptIds = rejectedRegisters.map((r) => r.aptId!);

      const result = await this.repo.cleanupAdminsAndApts(registerIds, aptIds);
      if (!result) {
        throw new CustomError(401, '거절한 관리자/사용자 정보 일괄 삭제 중 오류가 발생했습니다');
      }
      return;
    } else {
      const result = await this.repo.cleanupUser(user.aptId!);
      if (!result) {
        throw new CustomError(401, '거절한 관리자/사용자 정보 일괄 삭제 중 오류가 발생했습니다');
      }
      return;
    }
  };
}
