import { prisma } from '@libs/prisma';
import { Prisma } from '@prisma/client';

export class AuthRepo {
  constructor() {}

  async findUserByUniqueFields(params: { email: string; nickname: string; phoneNumber: string }) {
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
  }

  async findApartmentByName(apartmentName: string) {
    return prisma.apartment.findFirst({
      where: {
        aptName: apartmentName,
      },
    });
  }

  async findAnyApartment() {
    return prisma.apartment.findFirst();
  }

  async findApartmentByAddress(apartmentAddress: string) {
    return prisma.apartment.findFirst({
      where: {
        aptAdress: apartmentAddress,
      },
    });
  }

  async findApartmentByOfficeNumber(officeNumber: string) {
    return prisma.apartment.findFirst({
      where: {
        officeNumber,
      },
    });
  }

  async findApartmentReqByAddress(apartmentAddress: string) {
    return prisma.apartmentReq.findFirst({
      where: {
        aptAdress: apartmentAddress,
      },
    });
  }

  async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  async createApartment(data: Prisma.ApartmentCreateInput) {
    return prisma.apartment.create({ data });
  }

  async createRegisterRequest(data: Prisma.RegisterReqCreateInput) {
    return prisma.registerReq.create({ data });
  }

  async createApartmentRequest(data: Prisma.ApartmentReqCreateInput) {
    return prisma.apartmentReq.create({ data });
  }
}
