import bcrypt from 'bcrypt';
import { IsHouseHold, RegisterStatus, Prisma } from '@prisma/client';
import { AuthRepo } from '@modules/auth/auth.repo';
import { CustomError } from '@libs/error';
import { AdminSignupInput, SignupInput, SuperAdminSignupInput } from '@modules/auth/auth.validate';
import { signupDto } from '@modules/auth/dto/Response.dto';
import { createTokens } from '@modules/auth/utils/token';
import { getImage } from '@modules/user/utils/s3.handler';
import { withoutPasswordUser } from '@app-types/user.types';
import { makeDong, makeHo } from '@modules/auth/utils/apt.dong.ho.';

export class AuthService {
  constructor(private repo: AuthRepo) {}

  signup = async (input: SignupInput) => {
    const existingUser = await this.repo.findUserByUniqueFields({
      email: input.email,
      username: input.username,
      phoneNumber: input.contact,
    });
    if (existingUser && existingUser.deletedAt === null) {
      throw new CustomError(409, '이미 승인된 유저가 사용 중인 정보입니다');
    }

    const existingRegister = await this.repo.findRegisterByUniqueFields({
      email: input.email,
      username: input.username,
      phoneNumber: input.contact,
    });
    //  가입 신청 요청 체크 (PENDING인 경우만 차단, REJECTED/DELETED는 패스)
    if (existingRegister) {
      if (existingRegister.register_status === 'PENDING' && existingRegister.deletedAt === null) {
        throw new CustomError(409, '이미 검토 중인 회원가입 요청입니다.');
      }
    }

    const apartment = await this.repo.findApartmentByName(input.apartmentName);
    if (!apartment) {
      throw new CustomError(404, '존재하지 않는 아파트입니다');
    }

    const invalidDong = makeDong(apartment);
    const invalidHo = makeHo(apartment);

    if (input.apartmentDong < invalidDong.min || input.apartmentDong > invalidDong.max) {
      throw new CustomError(400, '해당 아파트의 동 범위를 벗어났습니다.');
    }
    if (input.apartmentHo < invalidHo.min || input.apartmentHo > invalidHo.max) {
      throw new CustomError(400, '해당 아파트의 호수 범위를 벗어났습니다.');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(input.password, salt);

    // 명단에 있을 시 자동 승인 처리
    const roster = await this.repo.findRosterMatch({
      aptId: apartment.id,
      dong: input.apartmentDong,
      ho: input.apartmentHo,
      name: input.name,
      phoneNumber: input.contact,
    });
    if (roster) {
      const approvedUser = await this.repo.autoApprovedUser(
        input,
        apartment.id,
        roster.id,
        hashedPassword,
        existingRegister?.id,
      );
      return signupDto(approvedUser);
    }

    /* 중복 회원가입 요청 데이터는 있지만 조건에 안걸린 경우 REJECTED,삭제 상태인 경우 복구
     * 회원가입 요청이 없는 경우 생성*/
    const register = existingRegister
      ? await this.repo.restoreUserRegister(
          existingRegister.id,
          input,
          apartment.id,
          hashedPassword,
        )
      : await this.repo.createUserRegister(input, apartment.id, hashedPassword);
    if (!register) {
      throw new CustomError(400, '회원가입 요청을 생성하지 못했습니다');
    }

    const notification = await this.repo.createUserSignupNotification(
      apartment.id,
      apartment.aptName,
    );
    return signupDto(register);
  };

  signupAdmin = async (input: AdminSignupInput) => {
    // 유저 체크 (승인 후 활동 중인 유저)
    const existingUser = await this.repo.findUserByUniqueFields({
      email: input.email,
      username: input.username,
      phoneNumber: input.contact,
    });
    if (existingUser && existingUser.deletedAt === null) {
      throw new CustomError(409, '이미 승인된 유저가 사용 중인 정보입니다.');
    }

    //  가입 신청 요청 체크 (PENDING인 경우만 차단, REJECTED/DELETED는 패스)
    const existingRegister = await this.repo.findRegisterByUniqueFields({
      email: input.email,
      username: input.username,
      phoneNumber: input.contact,
    });
    if (existingRegister) {
      if (existingRegister.register_status === 'PENDING' && existingRegister.deletedAt === null) {
        throw new CustomError(409, '이미 검토 중인 회원가입 요청입니다.');
      }
    }

    //아파트 정보 중복 체크 (PENDING/APPROVED인 경우만 차단)
    const existingApt = await this.repo.findApartmentByUniqueFields(
      input.apartmentAddress,
      input.apartmentManagementNumber,
    );
    if (existingApt) {
      if (existingApt.aptStatus === 'PENDING' || existingApt.aptStatus === 'APPROVED') {
        const isAddressMatch = existingApt.aptAddress === input.apartmentAddress;
        throw new CustomError(
          409,
          existingApt.aptStatus === 'PENDING'
            ? '이미 가입 신청 후 검토 중인 아파트 정보입니다.'
            : isAddressMatch
              ? '이미 등록된 아파트 주소입니다.'
              : '이미 등록된 관리소 번호입니다.',
        );
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(input.password, salt);

    /* 중복 아파트 데이터는 있지만 조건에 안걸린 경우 (REJECTED,삭제) 상태인 경우 복구
     * 아파트 정보가 없는 경우 생성*/
    const apartment = existingApt
      ? await this.repo.restoreApartment(existingApt.id, input)
      : await this.repo.createApartment(input);

    /* 중복 회원가입 요청 데이터는 있지만 조건에 안걸린 경우(REJECTED,삭제)상태인 경우 복구
     * 회원가입 요청이 없는 경우 생성*/
    const register = existingRegister
      ? await this.repo.restoreAdminRegister(
          existingRegister.id,
          input,
          apartment.id,
          hashedPassword,
        )
      : await this.repo.createAdminRegister(input, apartment.id, hashedPassword);

    const notification = await this.repo.createAdminSignupNotification(apartment.aptName);

    return signupDto(register);
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

    if (existingUser && existingUser.deletedAt === null) {
      throw new CustomError(409, '이미 사용 중인 정보입니다');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(input.password, salt); // 비밀번호 해시(서명) 저장

    const { role: requestedRole, ...user } = await this.repo.createSuperAdminUser(
      input,
      hashedPassword,
    );

    return signupDto({ ...user, requestedRole });
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

  refresh = async (user: withoutPasswordUser) => {
    const { accessToken, refreshToken } = createTokens(user.id);
    return { accessToken, refreshToken };
  };

  updateAdminStatus = async (adminRegisterId: string, reqStatus: string) => {
    const register = await this.repo.findRegisterById(adminRegisterId);
    if (!register) {
      throw new CustomError(404, '존재하지 않는 관리자 회원가입 요청입니다');
    }

    if (reqStatus === 'APPROVED') {
      if (!register.aptId) {
        throw new CustomError(400, '아파트 정보가 없습니다');
      }
      await this.repo.registerApprove(adminRegisterId);
      await this.repo.aptApprove(register.aptId);
      const user = await this.repo.upsertUser(register);

      // 이미 생성된 게시판이 있는지 확인 (재가입)
      const hasBoards = await this.repo.checkBoards(register.aptId!);

      // 보드가 없는 경우에만(신규 가입) 3대 필수 게시판 생성
      if (!hasBoards) {
        await this.repo.createManyBoard([
          { aptId: user.aptId!, boardType: 'NOTICE' },
          { aptId: user.aptId!, boardType: 'VOTE' },
          { aptId: user.aptId!, boardType: 'COMPLAINT' },
        ]);
      }
    } else {
      await this.repo.registerReject(adminRegisterId);
      if (register.aptId) {
        await this.repo.aptReject(register.aptId);
      }
    }
    return;
  };

  updateResidentStatus = async (
    residentRegisterId: string,
    status: string,
    admin: withoutPasswordUser,
  ) => {
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

      // 삭제 후 재 가입을 대비, 삭제된 정보가 있으면 업데이트 없으면 새로 생성
      const user = await this.repo.upsertUser(register);
      await this.repo.upsertResident({
        userId: user.id,
        aptId: register.aptId,
        dong: register.dong,
        ho: register.ho,
      });

      const findRoster = await this.repo.findRosterByContact(
        register.aptId!,
        register.phoneNumber!,
      );
      // 유저로부터 명단 생성 이후, 이미 명단에 있는 데이터인 경우 유저 정보와 동기화 로직
      if (findRoster) {
        await this.repo.updateRosterWithUser(findRoster.id, {
          userId: user.id,
          adminId: admin.id,
          dong: register.dong!,
          ho: register.ho!,
          name: register.name,
        });
      } else {
        const roster = await this.repo.createRoster(user, register, admin.id);
        if (!roster) {
          throw new CustomError(400, '입주민 명단 등록에 실패했습니다');
        }
      }
    } else {
      await this.repo.registerReject(residentRegisterId);
    }
    return;
  };

  updateAdminsStatusBatch = async (status: string) => {
    const pendingAdminRegisters = await this.repo.findPendingAdminRegisters();
    if (pendingAdminRegisters.length === 0) {
      throw new CustomError(404, '승인 대기 상태의 관리자 회원가입 요청이 없습니다');
    }
    if (status === 'APPROVED') {
      const result = await this.repo.approveAllPendingAdminsBatch(pendingAdminRegisters);
      return result;
    } else {
      await this.repo.rejectAllPendingAdminsBatch(pendingAdminRegisters);
      return;
    }
  };

  updateResidentsStatusBatch = async (admin: withoutPasswordUser, status: string) => {
    const pendingResidentRegisters = await this.repo.findPendingResidentRegisters(admin.aptId!);
    if (pendingResidentRegisters.length === 0) {
      throw new CustomError(404, '승인 대기 상태의 주민 회원가입 요청이 없습니다');
    }
    if (status === 'APPROVED') {
      const result = await this.repo.approveAllPendingResidentsBatch(
        pendingResidentRegisters,
        admin.id,
      );
      return result;
    } else {
      await this.repo.rejectAllPendingResidentsBatch(admin.aptId!);
      return;
    }
  };

  updateAdmin = async (
    adminId: string,
    adminData: Prisma.UserUpdateInput,
    aptData: Prisma.ApartmentUpdateInput,
  ) => {
    const admin = await this.repo.findUserById(adminId);
    if (!admin || admin.role !== 'ADMIN') {
      throw new CustomError(404, '존재하지 않는 관리자입니다');
    }

    //실제로 값이 들어온 게 있는지 확인
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
