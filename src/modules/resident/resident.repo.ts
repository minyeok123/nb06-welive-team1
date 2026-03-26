import { prisma } from '@libs/prisma';
import { Prisma, IsHouseHold } from '@prisma/client';
import {
  CreateRosterBody,
  PatchRosterBody,
  CreateRosterFromUser,
  RosterFromUser,
} from '@/types/resident.types';

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

  findRosterByContact = async (phoneNumber: string) => {
    return await prisma.residentRoster.findUnique({
      where: {
        phoneNumber,
      },
    });
  };

  createRoster = async (adminId: string, aptId: string, data: CreateRosterBody) => {
    return await prisma.residentRoster.create({
      data: {
        dong: data.building,
        ho: data.unitNumber,
        phoneNumber: data.contact,
        name: data.name,
        is_houseHold: data.isHouseholder,
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

  createRosters = async (data: Prisma.residentRosterCreateManyInput[]) => {
    return await prisma.residentRoster.createMany({
      data,
      skipDuplicates: true, // 유니크 값인 연락처가 중복될 경우 건너뜀
    });
  };

  restoreRoster = async (id: string, data: CreateRosterBody) => {
    return await prisma.residentRoster.update({
      where: {
        id,
      },
      data: {
        dong: data.building,
        ho: data.unitNumber,
        phoneNumber: data.contact,
        name: data.name,
        is_houseHold: data.isHouseholder,
        deletedAt: null,
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

  restoreRosterFromUser = async (id: string, data: RosterFromUser) => {
    return await prisma.residentRoster.update({
      where: {
        id,
      },
      data: {
        dong: data.dong,
        ho: data.ho,
        phoneNumber: data.phoneNumber,
        name: data.name,
        is_registered: data.is_registered,
        deletedAt: null,
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

  findHouseholder = async (aptId: string, dong?: number, ho?: number) => {
    return await prisma.residentRoster.findFirst({
      where: {
        aptId,
        dong,
        ho,
        is_houseHold: 'HOUSEHOLDER',
        deletedAt: null,
      },
    });
  };

  getRosterDetail = async (id: string) => {
    return await prisma.residentRoster.findFirst({
      where: {
        id,
        deletedAt: null,
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
        aptId: true,
        user: {
          select: {
            email: true,
            register_status: true,
          },
        },
      },
    });
  };

  patchRoster = async (id: string, data: PatchRosterBody) => {
    return await prisma.residentRoster.update({
      where: {
        id,
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

  softDeleteRoster = async (id: string, userId: string | null) => {
    return await prisma.$transaction(async (tx) => {
      if (userId) {
        // 1. 유저 정보 조회 (가입 신청서 ID 확인 목적)
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { registerId: true },
        });

        // 2. 유저 상세 거주 정보(Resident) 소프트 딜리트
        await tx.resident.updateMany({
          where: { userId: userId, deletedAt: null },
          data: { deletedAt: new Date() },
        });

        // 3. 최초 가입 신청서(Register) 소프트 딜리트
        if (user?.registerId) {
          await tx.register.updateMany({
            where: { id: user.registerId, deletedAt: null },
            data: { deletedAt: new Date() },
          });
        }

        // 4. 유저 본인(User) 소프트 딜리트
        await tx.user.update({
          where: { id: userId },
          data: { deletedAt: new Date() },
        });
      }

      // 5. 명단(ResidentRoster) 소프트 딜리트
      return await tx.residentRoster.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });
    });
  };

  findRegister = async (userId: string) => {
    return await prisma.register.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });
  };

  patchUser = async (
    userId: string,
    data: {
      name: string;
      phoneNumber: string;
      dong: number;
      ho: number;
      isHouseholder: IsHouseHold;
    },
  ) => {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
        resident: {
          update: {
            dong: data.dong,
            ho: data.ho,
            is_houseHold: data.isHouseholder,
          },
        },
      },
    });
  };

  createRosterFromUser = async (aptId: string, adminId: string, data: RosterFromUser) => {
    return await prisma.residentRoster.create({
      data: {
        dong: data.dong,
        ho: data.ho,
        name: data.name,
        phoneNumber: data.phoneNumber,
        admin: {
          connect: {
            id: adminId,
          },
        },
        apartment: {
          connect: {
            id: aptId,
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
