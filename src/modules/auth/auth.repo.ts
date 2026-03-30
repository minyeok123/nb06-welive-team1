import { prisma } from '@libs/prisma';
import { BoardType, Prisma, RegisterStatus, NotificationType } from '@prisma/client';
import { signupBody, AdminSignupBody, Register, SuperAdminSignupBody } from '@app-types/auth.type';
import { withoutPasswordUser } from '@app-types/user.types';
export class AuthRepo {
  constructor() {}

  findUserByUniqueFields = async (params: {
    email: string;
    username: string;
    phoneNumber: string;
  }) => {
    return prisma.user.findFirst({
      where: {
        OR: [
          { email: params.email },
          { username: params.username },
          { phoneNumber: params.phoneNumber },
        ],
      },
      select: {
        id: true,
        deletedAt: true,
      },
    });
  };

  findRegisterByUniqueFields = async (data: Prisma.RegisterWhereUniqueInput) => {
    return prisma.register.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }, { phoneNumber: data.phoneNumber }],
      },
      select: {
        id: true,
        register_status: true,
        deletedAt: true,
      },
    });
  };

  restoreUserRegister = async (
    id: string,
    data: signupBody,
    aptId: string,
    hashedPassword: string,
  ) => {
    return prisma.register.update({
      where: { id },
      data: {
        username: data.username,
        name: data.name,
        email: data.email,
        phoneNumber: data.contact,
        password: hashedPassword,
        requestedRole: data.role,
        aptId: aptId,
        dong: data.apartmentDong,
        ho: data.apartmentHo,
        deletedAt: null,
        register_status: 'PENDING',
      },
    });
  };

  restoreAdminRegister = async (
    id: string,
    data: AdminSignupBody,
    aptId: string,
    hashedPassword: string,
  ) => {
    return prisma.register.update({
      where: { id },
      data: {
        username: data.username,
        register_status: 'PENDING',
        deletedAt: null,
        aptId: aptId,
        phoneNumber: data.contact,
        name: data.name,
        email: data.email,
        password: hashedPassword,
        requestedRole: data.role,
      },
    });
  };

  restoreApartment = async (id: string, data: AdminSignupBody) => {
    return prisma.apartment.update({
      where: { id },
      data: {
        aptName: data.apartmentName,
        aptAddress: data.apartmentAddress,
        description: data.description,
        officeNumber: data.apartmentManagementNumber,
        startComplexNumber: data.startComplexNumber,
        endComplexNumber: data.endComplexNumber,
        startDongNumber: data.startDongNumber,
        endDongNumber: data.endDongNumber,
        startFloorNumber: data.startFloorNumber,
        endFloorNumber: data.endFloorNumber,
        startHoNumber: data.startHoNumber,
        endHoNumber: data.endHoNumber,
        aptStatus: 'PENDING', // 재신청 시 대기 상태로
        deletedAt: null, // 삭제 해제
      },
    });
  };

  findUserByEmail = async (email: string) => {
    return prisma.user.findFirst({ where: { email } });
  };

  findUserByPhoneNumber = async (phoneNumber: string) => {
    return prisma.user.findFirst({ where: { phoneNumber } });
  };

  findApartmentById = async (id: string) => {
    return prisma.apartment.findUnique({ where: { id } });
  };

  findAnyApartment = async () => {
    return prisma.apartment.findFirst();
  };

  findApartmentByName = async (apartmentName: string) => {
    return prisma.apartment.findFirst({
      where: {
        aptName: apartmentName,
        aptStatus: 'APPROVED',
        deletedAt: null,
      },
    });
  };

  findApartmentByUniqueFields = async (address: string, officeNumber: string) => {
    return prisma.apartment.findFirst({
      where: {
        OR: [{ aptAddress: address }, { officeNumber: officeNumber }],
      },
    });
  };

  findApartmentByAddress = async (apartmentAddress: string) => {
    return prisma.apartment.findFirst({
      where: {
        aptAddress: apartmentAddress,
      },
    });
  };

  findApartmentByOfficeNumber = async (officeNumber: string) => {
    return prisma.apartment.findFirst({
      where: {
        officeNumber,
      },
    });
  };

  upsertUser = async (register: Register) => {
    return prisma.user.upsert({
      where: { email: register.email },
      update: {
        username: register.username,
        phoneNumber: register.phoneNumber,
        name: register.name,
        password: register.password,
        role: register.requestedRole,
        register_status: RegisterStatus.APPROVED,
        registerId: register.id,
        aptId: register.aptId!,
        deletedAt: null,
      },
      create: {
        username: register.username,
        phoneNumber: register.phoneNumber,
        name: register.name,
        email: register.email,
        password: register.password,
        role: register.requestedRole,
        register_status: RegisterStatus.APPROVED,
        register: { connect: { id: register.id } },
        apartment: { connect: { id: register.aptId! } },
      },
    });
  };

  createSuperAdminUser = async (data: SuperAdminSignupBody, hashedPassword: string) => {
    return prisma.user.create({
      data: {
        username: data.username,
        phoneNumber: data.contact,
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        register_status: data.joinStatus,
      },
    });
  };
  createApartment = async (data: AdminSignupBody) => {
    return prisma.apartment.create({
      data: {
        aptName: data.apartmentName,
        aptAddress: data.apartmentAddress,
        officeNumber: data.apartmentManagementNumber,
        description: data.description,
        startComplexNumber: data.startComplexNumber,
        endComplexNumber: data.endComplexNumber,
        startDongNumber: data.startDongNumber,
        endDongNumber: data.endDongNumber,
        startFloorNumber: data.startFloorNumber,
        endFloorNumber: data.endFloorNumber,
        startHoNumber: data.startHoNumber,
        endHoNumber: data.endHoNumber,
      },
    });
  };

  createUserRegister = async (data: signupBody, aptId: string, hashedPassword: string) => {
    return prisma.register.create({
      data: {
        register_status: 'PENDING',
        aptId: aptId,
        username: data.username,
        phoneNumber: data.contact,
        name: data.name,
        email: data.email,
        password: hashedPassword,
        requestedRole: data.role,
        dong: data.apartmentDong,
        ho: data.apartmentHo,
      },
    });
  };

  createAdminRegister = async (data: AdminSignupBody, aptId: string, hashedPassword: string) => {
    return prisma.register.create({
      data: {
        register_status: 'PENDING',
        aptId: aptId,
        username: data.username,
        phoneNumber: data.contact,
        name: data.name,
        email: data.email,
        password: hashedPassword,
        requestedRole: data.role,
      },
    });
  };

  findRosterMatch = async (params: Prisma.residentRosterWhereInput) => {
    return await prisma.residentRoster.findFirst({
      where: {
        aptId: params.aptId,
        dong: params.dong,
        ho: params.ho,
        name: params.name,
        userId: null,
        phoneNumber: params.phoneNumber,
        deletedAt: null,
      },
    });
  };

  autoApprovedUser = async (
    params: signupBody,
    aptId: string,
    rosterId: string,
    hashedPassword: string,
    existingRegisterId?: string,
  ) => {
    return await prisma.$transaction(async (tx) => {
      //  Register 생성 (APPROVED 상태) 또는 거절 되거나 삭제된 데이터 복구
      const register = existingRegisterId
        ? await tx.register.update({
            where: { id: existingRegisterId },
            data: {
              username: params.username,
              password: hashedPassword,
              register_status: 'APPROVED',
              email: params.email,
              phoneNumber: params.contact,
              requestedRole: params.role,
              aptId,
              dong: params.apartmentDong,
              ho: params.apartmentHo,
              name: params.name,
              deletedAt: null, // 삭제되었어도 복원
            },
          })
        : await tx.register.create({
            data: {
              username: params.username,
              password: hashedPassword,
              register_status: 'APPROVED',
              email: params.email,
              phoneNumber: params.contact,
              requestedRole: params.role,
              aptId,
              dong: params.apartmentDong,
              ho: params.apartmentHo,
              name: params.apartmentName,
            },
            select: {
              id: true,
              name: true,
              email: true,
              register_status: true,
              requestedRole: true,
              deletedAt: true,
            },
          });
      //  User 업서트 (이메일로 비교하여 있으면 복구 및 업데이트, 없으면 생성)
      const user = await tx.user.upsert({
        where: { email: params.email },
        update: {
          username: params.username,
          password: hashedPassword,
          phoneNumber: params.contact,
          name: params.name,
          role: params.role,
          register_status: 'APPROVED',
          aptId,
          registerId: register.id,
          deletedAt: null,
        },
        create: {
          username: params.username,
          password: hashedPassword,
          email: params.email,
          phoneNumber: params.contact,
          name: params.name,
          role: params.role,
          register_status: 'APPROVED',
          apartment: { connect: { id: aptId } },
          register: { connect: { id: register.id } },
        },
      });

      //  Resident 업서트 (유저와 1:1 관계 복구 및 정보 갱신)
      await tx.resident.upsert({
        where: { userId: user.id },
        update: {
          aptId,
          dong: params.apartmentDong,
          ho: params.apartmentHo,
          deletedAt: null,
        },
        create: {
          userId: user.id,
          aptId,
          dong: params.apartmentDong,
          ho: params.apartmentHo,
        },
      });

      //  명부 업데이트 (유저와 연결 및 등록 상태 변경)
      await tx.residentRoster.update({
        where: { id: rosterId },
        data: {
          user: { connect: { id: user.id } },
          is_registered: true,
        },
      });
      return register;
    });
  };

  findUserByUsername = async (username: string) => {
    return await prisma.user.findFirst({
      where: { username, deletedAt: null },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        aptId: true,
        register_status: true,
        role: true,
        phoneNumber: true,
        password: true,
        profileImg: true,
        deletedAt: true,
        apartment: {
          select: {
            aptName: true,
            boards: {
              select: {
                id: true,
                boardType: true,
              },
            },
          },
        },
        resident: {
          select: {
            dong: true,
          },
        },
      },
    });
  };

  findUserById = async (id: string) => {
    return await prisma.user.findUnique({ where: { id } });
  };

  findRegisterById = async (id: string) => {
    return await prisma.register.findFirst({
      where: { id, deletedAt: null, register_status: 'PENDING' },
    });
  };

  findRegisterByUsername = async (username: string) => {
    return await prisma.register.findUnique({ where: { username } });
  };

  registerApprove = async (id: string) => {
    return await prisma.register.update({
      where: { id },
      data: { register_status: 'APPROVED' },
    });
  };

  registerReject = async (id: string) => {
    return await prisma.register.update({
      where: { id },
      data: { register_status: 'REJECTED' },
    });
  };
  aptApprove = async (id: string) => {
    return await prisma.apartment.update({
      where: { id },
      data: { aptStatus: 'APPROVED' },
    });
  };
  aptReject = async (id: string) => {
    return await prisma.apartment.update({
      where: { id },
      data: { aptStatus: 'REJECTED' },
    });
  };

  upsertResident = async (data: { userId: string; aptId: string; dong: number; ho: number }) => {
    return await prisma.resident.upsert({
      where: { userId: data.userId },
      update: {
        aptId: data.aptId,
        dong: data.dong,
        ho: data.ho,
        deletedAt: null,
      },
      create: {
        userId: data.userId,
        aptId: data.aptId,
        dong: data.dong,
        ho: data.ho,
      },
    });
  };

  createRoster = async (user: withoutPasswordUser, register: Register, adminId: string) => {
    return await prisma.residentRoster.create({
      data: {
        apartment: { connect: { id: register.aptId! } },
        admin: { connect: { id: adminId } },
        user: { connect: { id: user.id } },
        dong: register.dong!,
        ho: register.ho!,
        name: user.name,
        phoneNumber: user.phoneNumber,
        is_registered: true,
        is_residence: true,
      },
    });
  };

  findRosterByContact = async (aptId: string, phoneNumber: string) => {
    return await prisma.residentRoster.findFirst({
      where: { aptId, phoneNumber },
    });
  };

  updateRosterWithUser = async (
    rosterId: string,
    data: { userId: string; adminId: string; dong: number; ho: number; name: string },
  ) => {
    return await prisma.residentRoster.update({
      where: { id: rosterId },
      data: {
        userId: data.userId,
        adminId: data.adminId,
        dong: data.dong,
        ho: data.ho,
        name: data.name,
        is_registered: true,
        is_residence: true,
        deletedAt: null,
      },
    });
  };

  createBoard = async (data: Prisma.BoardCreateInput) => {
    return await prisma.board.create({ data });
  };
  createManyBoard = async (data: Prisma.BoardCreateManyInput[]) => {
    return await prisma.board.createMany({ data });
  };

  checkBoards = async (aptId: string) => {
    const board = await prisma.board.findFirst({
      where: { aptId, deletedAt: null },
      select: { id: true },
    });
    return board ? true : false;
  };

  updateAdmin = async (id: string, data: Prisma.UserUpdateInput) => {
    return await prisma.user.update({ where: { id }, data });
  };

  updateApartment = async (id: string, data: Prisma.ApartmentUpdateInput) => {
    return await prisma.apartment.update({ where: { id }, data });
  };
  softDeleteApartmentAndUsers = async (aptId: string) => {
    return await prisma.$transaction(async (tx) => {
      const apartment = await tx.apartment.update({
        where: { id: aptId },
        data: {
          aptStatus: 'REJECTED',
          deletedAt: new Date(),
        },
      });

      const users = await tx.user.updateMany({
        where: { aptId, deletedAt: null },
        data: {
          register_status: 'REJECTED',
          deletedAt: new Date(),
        },
      });

      const registers = await tx.register.updateMany({
        where: { aptId, deletedAt: null },
        data: {
          register_status: 'REJECTED',
          deletedAt: new Date(),
        },
      });

      return { apartment, deletedUserCount: users.count + registers.count };
    });
  };

  findRejectedAdmin = async () => {
    return await prisma.register.findMany({
      where: {
        requestedRole: 'ADMIN',
        register_status: 'REJECTED',
        deletedAt: null,
      },
      select: { id: true, aptId: true },
    });
  };

  cleanupAdminsAndApts = async (registerIds: string[], aptIds: string[]) => {
    return await prisma.$transaction(async (tx) => {
      const deletedRegisters = await tx.register.updateMany({
        where: { id: { in: registerIds } },
        data: { deletedAt: new Date() },
      });

      if (aptIds.length > 0) {
        await tx.apartment.updateMany({
          where: { id: { in: aptIds }, deletedAt: null },
          data: { deletedAt: new Date() },
        });
      }

      return { count: deletedRegisters.count };
    });
  };

  cleanupUser = async (aptId: string) => {
    return await prisma.register.updateMany({
      where: {
        aptId,
        requestedRole: 'USER',
        register_status: 'REJECTED',
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });
  };

  findPendingAdminRegisters = async () => {
    return await prisma.register.findMany({
      where: {
        requestedRole: 'ADMIN',
        register_status: 'PENDING',
        deletedAt: null,
      },
    });
  };

  approveAllPendingAdminsBatch = async (pendingAdmins: Register[]) => {
    return await prisma.$transaction(async (tx) => {
      const adminRegisterIds = pendingAdmins.map((reg) => reg.id);
      const aptIds = pendingAdmins.map((reg) => reg.aptId).filter((id) => id !== null);
      await tx.register.updateMany({
        where: { id: { in: adminRegisterIds }, deletedAt: null },
        data: { register_status: 'APPROVED' },
      });
      // 모든 연관 아파트 상태 변경
      await tx.apartment.updateMany({
        where: { id: { in: aptIds }, deletedAt: null },
        data: { aptStatus: 'APPROVED' },
      });
      //  모든 관리자 유저 계정 일괄 생성
      const userData = pendingAdmins.map((adminRegister) => ({
        username: adminRegister.username,
        name: adminRegister.name,
        email: adminRegister.email,
        password: adminRegister.password,
        phoneNumber: adminRegister.phoneNumber,
        role: adminRegister.requestedRole,
        register_status: RegisterStatus.APPROVED,
        aptId: adminRegister.aptId!,
        registerId: adminRegister.id,
      }));
      await tx.user.createMany({ data: userData });
      // 모든 아파트 전용 게시판 일괄 생성
      const boardsData = aptIds.flatMap((aptId) => [
        { aptId, boardType: BoardType.NOTICE },
        { aptId, boardType: BoardType.VOTE },
        { aptId, boardType: BoardType.COMPLAINT },
      ]);
      await tx.board.createMany({ data: boardsData });
    });
  };

  rejectAllPendingAdminsBatch = async (pendingAdmins: Register[]) => {
    return await prisma.$transaction(async (tx) => {
      const adminIds = pendingAdmins.map((adminRegister) => adminRegister.id);
      const aptIds = pendingAdmins.map((reg) => reg.aptId).filter((id) => id !== null);

      await tx.register.updateMany({
        where: { id: { in: adminIds }, deletedAt: null },
        data: { register_status: 'REJECTED' },
      });
      await tx.apartment.updateMany({
        where: { id: { in: aptIds }, deletedAt: null },
        data: { aptStatus: 'REJECTED' },
      });
    });
  };

  findPendingResidentRegisters = async (aptId: string) => {
    return await prisma.register.findMany({
      where: {
        requestedRole: 'USER',
        register_status: 'PENDING',
        deletedAt: null,
        aptId,
      },
    });
  };

  approveAllPendingResidentsBatch = async (pendingResidents: Register[], adminId: string) => {
    return await prisma.$transaction(async (tx) => {
      const residentRegisterIds = pendingResidents.map((reg) => reg.id);
      //  가입 신청서 상태 변경
      await tx.register.updateMany({
        where: { id: { in: residentRegisterIds }, deletedAt: null },
        data: { register_status: 'APPROVED' },
      });
      //  유저 계정 일괄 생성
      const userData = pendingResidents.map((item) => ({
        username: item.username,
        name: item.name,
        email: item.email,
        password: item.password,
        phoneNumber: item.phoneNumber,
        role: item.requestedRole,
        register_status: RegisterStatus.APPROVED,
        aptId: item.aptId!,
        registerId: item.id,
      }));
      await tx.user.createMany({ data: userData });
      //  DB가 생성한 유저 정보 다시 조회 (동, 호 까지 함께)
      const createdUsers = await tx.user.findMany({
        where: { registerId: { in: residentRegisterIds }, deletedAt: null },
        select: {
          id: true,
          aptId: true,
          name: true,
          phoneNumber: true,
          register: {
            select: { id: true, dong: true, ho: true },
          },
        },
      });
      // 입주민 정보 생성
      const residentData = createdUsers.map((user) => ({
        userId: user.id,
        aptId: user.aptId!,
        dong: user.register!.dong!,
        ho: user.register!.ho!,
      }));

      // 주민 정보 일괄 생성
      await tx.resident.createMany({
        data: residentData,
      });

      //입주민 명단 테이블 정보 생성
      const rosterData = createdUsers.map((user) => ({
        aptId: user.aptId!,
        adminId: adminId,
        userId: user.id,
        dong: user.register!.dong!,
        ho: user.register!.ho!,
        name: user.name,
        phoneNumber: user.phoneNumber,
        is_registered: true,
        is_residence: true,
      }));

      //  입주민 명단 일괄 등록
      await tx.residentRoster.createMany({
        data: rosterData,
      });
    });
  };

  rejectAllPendingResidentsBatch = async (aptId: string) => {
    return await prisma.register.updateMany({
      where: { aptId, register_status: 'PENDING', requestedRole: 'USER', deletedAt: null },
      data: { register_status: 'REJECTED' },
    });
  };

  createAdminSignupNotification = async (aptName: string) => {
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN', deletedAt: null },
      select: { id: true },
    });
    if (superAdmins.length === 0) return null;

    const notificationData = superAdmins.map((admin) => ({
      userId: admin.id,
      notificationType: NotificationType.SIGNUP_REQ,
      message: `${aptName} 아파트의 관리자 가입 요청이 들어왔습니다.`,
      notificatedAt: new Date(),
    }));
    return await prisma.notification.createMany({
      data: notificationData,
    });
  };

  createUserSignupNotification = async (aptId: string, aptName: string) => {
    const Admins = await prisma.user.findMany({
      where: { aptId, role: 'ADMIN', deletedAt: null },
      select: { id: true },
    });
    if (Admins.length === 0) return null;

    const notificationData = Admins.map((admin) => ({
      userId: admin.id,
      notificationType: NotificationType.SIGNUP_REQ,
      message: `${aptName} 아파트의 입주민 가입 요청이 들어왔습니다.`,
      notificatedAt: new Date(),
    }));
    return await prisma.notification.createMany({
      data: notificationData,
    });
  };
}
