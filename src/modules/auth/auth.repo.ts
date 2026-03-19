import { prisma } from '@libs/prisma';
import { Prisma, RegisterStatus } from '@prisma/client';
import { signupBody, AdminSignupBody, Register, SuperAdminSignupBody } from '@/types/auth.type';
import { withoutPasswordUser } from '@/types/user.types';
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
        deletedAt: null,
      },
      select: {
        id: true,
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

  createUser = async (register: Register) => {
    return prisma.user.create({
      data: {
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
      // 1. Register 생성 (APPROVED 상태) 또는 거절 되거나 삭제된 데이터 복구
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
      // 2. User 생성 (Register와 연결)
      const user = await tx.user.create({
        data: {
          username: params.username,
          password: hashedPassword,
          email: params.email,
          phoneNumber: params.contact,
          name: params.name,
          role: params.role,
          apartment: { connect: { id: aptId } },
          register_status: 'APPROVED',
          register: { connect: { id: register.id } },
          resident: {
            create: {
              apartment: { connect: { id: aptId } },
              dong: params.apartmentDong,
              ho: params.apartmentHo,
            },
          },
        },
      });

      // 4. 명부(ResidentRoster) 업데이트 (유저와 연결 및 등록 상태 변경)
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

  createResident = async (data: Prisma.ResidentCreateInput) => {
    return await prisma.resident.create({ data });
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

  updateRosterWithUser = async (rosterId: string, userId: string) => {
    return await prisma.residentRoster.update({
      where: { id: rosterId },
      data: { userId, is_registered: true },
    });
  };

  createBoard = async (data: Prisma.BoardCreateInput) => {
    return await prisma.board.create({ data });
  };
  createManyBoard = async (data: Prisma.BoardCreateManyInput[]) => {
    return await prisma.board.createMany({ data });
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
        data: { deletedAt: new Date() },
      });

      const users = await tx.user.updateMany({
        where: { aptId, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      return { apartment, deletedUserCount: users.count };
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
}
