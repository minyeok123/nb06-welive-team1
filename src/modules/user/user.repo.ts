import { prisma } from '@libs/prisma';
import { Prisma } from '@prisma/client';

export class UserRepo {
  findUserById = async (id: string) => {
    return await prisma.user.findUnique({
      where: {
        id,
      },
    });
  };

  updateUserPassword = async (id: string, password: string) => {
    return await prisma.user.update({
      where: {
        id,
      },
      data: {
        password,
      },
    });
  };
}
