import { prisma } from '@libs/prisma';

export class NotificationRepo {
  findUnreadByUserId = async (userId: string) => {
    return prisma.notification.findMany({
      where: {
        userId,
        is_read: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  };

  findById = async (id: string) => {
    return prisma.notification.findUnique({
      where: { id },
    });
  };

  markAsRead = async (id: string) => {
    return prisma.notification.update({
      where: { id },
      data: { is_read: true },
    });
  };
}
