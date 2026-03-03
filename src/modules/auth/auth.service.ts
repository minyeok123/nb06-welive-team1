import bcrypt from 'bcrypt';
import { RegisterStatus } from '@prisma/client';
import { AuthRepo } from './auth.repo';
import { CustomError } from '@libs/error';
import { AdminSignupInput, SignupInput, SuperAdminSignupInput } from './auth.validate';
import { createTokens } from './utils/token';

export class AuthService {
  constructor(private repo: AuthRepo) {}

  signup = async (input: SignupInput) => {
    const existingUser = await this.repo.findUserByUniqueFields({
      email: input.email,
      nickname: input.username,
      phoneNumber: input.contact,
    });

    if (existingUser) {
      throw new CustomError(409, '이미 사용 중인 정보입니다');
    }

    const apartment = await this.repo.findApartmentByName(input.apartmentName);
    if (!apartment) {
      throw new CustomError(400, '존재하지 않는 아파트입니다');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await this.repo.createUser({
      nickname: input.username,
      phoneNumber: input.contact,
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      register_status: RegisterStatus.PENDING,
      apartment: {
        connect: { id: apartment.id },
      },
    });

    await this.repo.createRegisterRequest({
      user: { connect: { id: user.id } },
      register_status: RegisterStatus.PENDING,
      aptId: apartment.id,
      requestedRole: input.role,
      dong: input.role === 'USER' ? input.apartmentDong : undefined,
      ho: input.role === 'USER' ? input.apartmentHo : undefined,
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

  signupAdmin = async (input: AdminSignupInput) => {
    if (input.role !== 'ADMIN') {
      throw new CustomError(400, '관리자 회원가입 요청이 아닙니다');
    }

    const existingUser = await this.repo.findUserByUniqueFields({
      email: input.email,
      nickname: input.username,
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

    const existingApartmentReq = await this.repo.findApartmentReqByAddress(input.apartmentAddress);
    if (existingApartmentReq) {
      throw new CustomError(409, '이미 등록 요청된 아파트입니다');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const apartment = await this.repo.createApartment({
      aptName: input.apartmentName,
      aptAdress: input.apartmentAddress,
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

    const user = await this.repo.createUser({
      nickname: input.username,
      phoneNumber: input.contact,
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      register_status: RegisterStatus.PENDING,
      apartment: {
        connect: { id: apartment.id },
      },
    });

    await this.repo.createRegisterRequest({
      user: { connect: { id: user.id } },
      register_status: RegisterStatus.PENDING,
      aptId: apartment.id,
      requestedRole: input.role,
    });

    await this.repo.createApartmentRequest({
      registerReq: { connect: { userId: user.id } },
      aptName: input.apartmentName,
      aptAdress: input.apartmentAddress,
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

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      joinStatus: user.register_status,
      isActive: user.register_status === RegisterStatus.APPROVED,
      role: user.role,
    };
  };

  signupSuperAdmin = async (input: SuperAdminSignupInput) => {
    if (input.role !== 'SUPER_ADMIN') {
      throw new CustomError(400, '슈퍼 관리자 회원가입 요청이 아닙니다');
    }

    const existingUser = await this.repo.findUserByUniqueFields({
      email: input.email,
      nickname: input.username,
      phoneNumber: input.contact,
    });

    if (existingUser) {
      throw new CustomError(409, '이미 사용 중인 정보입니다');
    }

    const apartment = await this.repo.findAnyApartment();
    if (!apartment) {
      throw new CustomError(400, '아파트가 존재하지 않습니다');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const registerStatus = input.joinStatus ?? RegisterStatus.PENDING;

    const user = await this.repo.createUser({
      nickname: input.username,
      phoneNumber: input.contact,
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      register_status: registerStatus,
      apartment: {
        connect: { id: apartment.id },
      },
    });

    await this.repo.createRegisterRequest({
      user: { connect: { id: user.id } },
      register_status: registerStatus,
      aptId: apartment.id,
      requestedRole: input.role,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      joinStatus: user.register_status,
      isActive: user.register_status === RegisterStatus.APPROVED,
      role: user.role,
    };
  };

  login = async (username: string, password: string) => {
    const user = await this.repo.findUserByEmail(username);
    if (!user) throw new CustomError(404, '존재하지 않은 유저 또는 비밀번호가 일치하지 않습니다');

    const verifyPassword = await bcrypt.compare(password, user.password);
    if (!verifyPassword)
      throw new CustomError(401, '존재하지 않은 유저 또는 비밀번호가 일치하지 않습니다');

    if (user.register_status === RegisterStatus.PENDING) {
      throw new CustomError(403, '아직 승인되지 않은 유저입니다');
    }

    if (user.deletedAt !== null) {
      throw new CustomError(403, '탈퇴한 유저입니다');
    }

    const { password: _, ...withoutPassowrd } = user;
    const { accessToken, refreshToken } = createTokens(user.id);
    return { accessToken, refreshToken, withoutPassowrd };
  };

  refresh = async (userId: number) => {
    const { accessToken, refreshToken } = createTokens(userId);
    return { accessToken, refreshToken };
  };
}
