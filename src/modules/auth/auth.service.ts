import bcrypt from 'bcrypt';
import { IsHouseHold, RegisterStatus } from '@prisma/client';
import { AuthRepo } from './auth.repo';
import { CustomError } from '@libs/error';
import { AdminSignupInput, SignupInput, SuperAdminSignupInput } from './auth.validate';
import { createTokens } from './utils/token';
import { getImage } from '../user/utils/s3.handler';

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

    const hashedPassword = await bcrypt.hash(input.password, 10); // 비밀번호 해시(서명) 저장

    const register = await this.repo.createRegister({
      register_status: RegisterStatus.PENDING,
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
}
