import { prisma } from '../../libs/prisma';
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
        aptAdress: apartmentAddress,
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

  createBoard = async (data: Prisma.BoardCreateInput) => {
    return await prisma.board.create({ data });
  };
  createManyBoard = async (data: Prisma.BoardCreateManyInput[]) => {
    return await prisma.board.createMany({ data });
  };
}
