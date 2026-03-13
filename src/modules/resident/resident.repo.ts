import { prisma } from '@libs/prisma';
import { Prisma, IsHouseHold } from '@prisma/client';
import { CreateRosterBody, PatchRosterBody, CreateRosterFromUser } from '@/types/resident.types';

export class ResidentRepo {
  constructor() {}

  getRosterList = async (
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

  createRoster = async ({ data }: { data: CreateRosterBody }) => {
    return await prisma.residentRoster.create({
      data: {
        dong: data.building,
        ho: data.unitNumber,
        phoneNumber: data.contact,
        name: data.name,
        is_houseHold: data.isHouseholder,
        apartment: {
          connect: {
            id: data.aptId,
          },
        },
        admin: {
          connect: {
            id: data.adminId,
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
        deletedAt: true,
        user: {
          select: {
            email: true,
            register_status: true,
          },
        },
      },
    });
  };

  patchRoster = async ({ data }: { data: PatchRosterBody }) => {
    return await prisma.residentRoster.update({
      where: {
        id: data.id,
      },
      data: {
        dong: data.building,
        ho: data.unitNumber,
        phoneNumber: data.contact,
        name: data.name,
        is_houseHold: data.isHouseholder,
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

  softDeleteRoster = async (id: string) => {
    return await prisma.residentRoster.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  };

  findRegister = async (userId: string) => {
    return await prisma.register.findUnique({
      where: {
        id: userId,
      },
    });
  };

  patchUser = async ({ data }: { data: { userId: string; isHouseholder: IsHouseHold } }) => {
    return await prisma.user.update({
      where: {
        id: data.userId,
      },
      data: {
        resident: {
          update: {
            is_houseHold: data.isHouseholder,
          },
        },
      },
    });
  };

  createRosterFromUser = async ({ data }: { data: CreateRosterFromUser }) => {
    return await prisma.residentRoster.create({
      data: {
        dong: data.dong,
        ho: data.ho,
        name: data.name,
        phoneNumber: data.phoneNumber,
        admin: {
          connect: {
            id: data.adminId,
          },
        },
        apartment: {
          connect: {
            id: data.aptId,
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
}
