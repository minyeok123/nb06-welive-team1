import { prisma } from '@libs/prisma';
import { Prisma } from '@prisma/client';

export class ResidentRepo {
  constructor() {}

  getResidentList = async (
    whereCondition: Prisma.residentRosterWhereInput,
    page: number,
    limit: number,
  ) => {
    return await prisma.$transaction(async (tx) => {
      const totalCount = await tx.residentRoster.count({
        where: whereCondition,
      });

      const rosters = await tx.residentRoster.findMany({
        where: whereCondition,
        select: {
          id: true,
          userId: true,
          dong: true,
          ho: true,
          name: true,
          phoneNumber: true,
          is_houseHold: true,
          is_registered: true,
          is_residence: true,
          user: {
            select: {
              email: true,
              register_status: true,
            },
          },
        },
        orderBy: [{ dong: 'asc' }, { ho: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      });

      return { totalCount, rosters };
    });
  };

  createRoster = async (
    building: number,
    unitNumber: number,
    contact: string,
    name: string,
    isHouseholder: 'HOUSEHOLDER' | 'MEMBER',
    adminId: string,
    aptId: string,
  ) => {
    return await prisma.residentRoster.create({
      data: {
        dong: building,
        ho: unitNumber,
        phoneNumber: contact,
        name: name,
        is_houseHold: isHouseholder,
        apartment: {
          connect: {
            id: aptId,
          },
        },
        admin: {
          connect: {
            id: adminId,
          },
        },
      },
      select: {
        id: true,
        userId: true,
        dong: true,
        ho: true,
        phoneNumber: true,
        name: true,
        is_houseHold: true,
        is_registered: true,
        is_residence: true,
        user: {
          select: {
            email: true,
            register_status: true,
          },
        },
      },
    });
  };

  getRosterDetail = async (id: string) => {
    return await prisma.residentRoster.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
        dong: true,
        ho: true,
        name: true,
        phoneNumber: true,
        is_houseHold: true,
        is_registered: true,
        is_residence: true,
        user: {
          select: {
            email: true,
            register_status: true,
          },
        },
      },
    });
  };
}
