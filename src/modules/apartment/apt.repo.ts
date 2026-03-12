import { prisma } from '@libs/prisma';
import { Prisma, Role } from '@prisma/client';

export class AptRepo {
  getListAptForSignUp = async (whereCondition: Prisma.ApartmentWhereInput) => {
    const { totalCount, aptList } = await prisma.$transaction(async (tx) => {
      const totalCount = await tx.apartment.count({
        where: whereCondition,
      });
      const aptList = await tx.apartment.findMany({
        where: whereCondition,
        orderBy: {
          aptName: 'asc',
        },
        take: 100,
        select: {
          aptName: true,
          aptAddress: true,
          id: true,
        },
      });

      return { totalCount, aptList };
    });

    return { totalCount, aptList };
  };

  getListApt = async (whereCondition: Prisma.ApartmentWhereInput, page: number, limit: number) => {
    const { totalCount, apartments } = await prisma.$transaction(async (tx) => {
      const totalCount = await tx.apartment.count({
        where: whereCondition,
      });
      const apartments = await tx.apartment.findMany({
        where: whereCondition,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          aptName: 'asc',
        },
        select: {
          id: true,
          aptName: true,
          aptAddress: true,
          aptStatus: true,
          description: true,
          officeNumber: true,
          startComplexNumber: true,
          endComplexNumber: true,
          startDongNumber: true,
          endDongNumber: true,
          startFloorNumber: true,
          endFloorNumber: true,
          startHoNumber: true,
          endHoNumber: true,
          users: {
            where: { role: Role.ADMIN },
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
      });

      return { totalCount, apartments };
    });

    return { totalCount, apartments };
  };

  getAptDetail = async (id: string) => {
    const aptDetail = await prisma.apartment.findUnique({
      where: { id },
      select: {
        id: true,
        aptName: true,
        aptAddress: true,
        aptStatus: true,
        description: true,
        officeNumber: true,
        startComplexNumber: true,
        endComplexNumber: true,
        startDongNumber: true,
        endDongNumber: true,
        startFloorNumber: true,
        endFloorNumber: true,
        startHoNumber: true,
        endHoNumber: true,
        users: {
          where: { role: Role.ADMIN },
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });
    return aptDetail;
  };

  getAptDetailPublic = async (id: string) => {
    const aptDetail = await prisma.apartment.findUnique({
      where: { id },
      select: {
        id: true,
        aptName: true,
        aptAddress: true,
        startComplexNumber: true,
        endComplexNumber: true,
        startDongNumber: true,
        endDongNumber: true,
        startFloorNumber: true,
        endFloorNumber: true,
        startHoNumber: true,
        endHoNumber: true,
      },
    });
    return aptDetail;
  };
}
