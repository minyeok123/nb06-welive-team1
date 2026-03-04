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
          },
        },
        resident: {
          select: {
            dong: true,
          },
        },
        boards: {
          select: {
            id: true,
            boardType: true,
          },
        },
      },
    });
  };

  findUserById = async (id: string) => {
    return await prisma.user.findUnique({ where: { id } });
  };
}
