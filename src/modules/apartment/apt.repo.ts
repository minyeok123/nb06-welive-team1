import { prisma } from '@libs/prisma';
import { Prisma } from '@prisma/client';

export class AptRepo {
  getListApt = async (whereCondition: Prisma.ApartmentWhereInput) => {
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
}
