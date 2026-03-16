import { prisma } from '@libs/prisma';
import { Prisma } from '@prisma/client';

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
        email: true,
        username: true,
        phoneNumber: true,
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

  createUser = async (data: Prisma.UserCreateInput) => {
    return prisma.user.create({ data });
  };

  createApartment = async (data: Prisma.ApartmentCreateInput) => {
    return prisma.apartment.create({ data });
  };

  createRegister = async (data: Prisma.RegisterCreateInput) => {
    return prisma.register.create({ data });
  };

  // 입주민 명부에서 개인정보 일치 여부 조회 (이름, 연락처, 동, 호)
  findResidentRosterMatch = async (params: {
    aptId: string;
    dong: number;
    ho: number;
    name: string;
    phoneNumber: string;
  }) => {
    const candidates = await prisma.residentRoster.findMany({
      where: {
        aptId: params.aptId,
        dong: params.dong,
        ho: params.ho,
        name: params.name,
        userId: null,
        deletedAt: null,
      },
    });
    const normalizedInput = params.phoneNumber.replace(/\D/g, '');
    return candidates.find(
      (r) =>
        r.phoneNumber === params.phoneNumber ||
        r.phoneNumber.replace(/\D/g, '') === normalizedInput,
    );
  };
  findUserByUsername = async (username: string) => {
    return await prisma.user.findUnique({
      where: { username },
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
    return await prisma.register.findUnique({ where: { id } });
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

  createRoster = async (data: Prisma.residentRosterCreateInput) => {
    return await prisma.residentRoster.create({ data });
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
    const now = new Date();
    return await prisma.$transaction(async (tx) => {
      const apartment = await tx.apartment.update({
        where: { id: aptId },
        data: { deletedAt: now },
      });

      const users = await tx.user.updateMany({
        where: { aptId, deletedAt: null },
        data: { deletedAt: now },
      });

      return { apartment, deletedUserCount: users.count };
    });
  };
}
