import { prisma } from '@libs/prisma';
import { Prisma } from '@prisma/client';

export class UserRepo {
  findUserById = async (id: string) => {
    return await prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  };

  updateUserPassword = async (id: string, password: string) => {
    return await prisma.user.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        password,
      },
    });
  };

  updateUserProfile = async (id: string, data: { password?: string; profileImg?: string }) => {
    return await prisma.user.update({
      where: { id, deletedAt: null },
      data,
    });
  };
}
