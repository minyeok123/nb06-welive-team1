import { prisma } from '../../libs/prisma';
import { Prisma } from '@prisma/client';

export class AuthRepo {
  constructor() {}

  findUserByUniqueFields = async (params: {
    email: string;
    nickname: string;
    phoneNumber: string;
  }) => {
    return prisma.user.findFirst({
      where: {
        OR: [
          { email: params.email },
          { nickname: params.nickname },
          { phoneNumber: params.phoneNumber },
        ],
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        phoneNumber: true,
      },
    });
  };

  findApartmentByName = async (apartmentName: string) => {
    return prisma.apartment.findFirst({
      where: {
        aptName: apartmentName,
      },
    });
  };

  findAnyApartment = async () => {
    return prisma.apartment.findFirst();
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

  findApartmentReqByAddress = async (apartmentAddress: string) => {
    return prisma.apartmentReq.findFirst({
      where: {
        aptAdress: apartmentAddress,
      },
    });
  };

  createUser = async (data: Prisma.UserCreateInput) => {
    return prisma.user.create({ data });
  };

  createApartment = async (data: Prisma.ApartmentCreateInput) => {
    return prisma.apartment.create({ data });
  };

  createRegisterRequest = async (data: Prisma.RegisterReqCreateInput) => {
    return prisma.registerReq.create({ data });
  };

  createApartmentRequest = async (data: Prisma.ApartmentReqCreateInput) => {
    return prisma.apartmentReq.create({ data });
  };
  findUserByEmail = async (email: string) => {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        nickname: true,
        email: true,
        aptId: true,
        register_status: true,
        role: true,
        phoneNumber: true,
        password: true,
        profileImg: true,
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

  findUserById = async (id: number) => {
    return await prisma.user.findUnique({ where: { id } });
  };
}
