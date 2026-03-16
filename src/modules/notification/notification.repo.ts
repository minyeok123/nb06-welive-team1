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

  findManyByUserId = async (params: {
    userId: string;
    isRead?: boolean;
    page: number;
    limit: number;
  }) => {
    const where = {
      userId: params.userId,
      ...(params.isRead !== undefined && { is_read: params.isRead }),
    };

    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return { notifications, totalCount };
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

  markAllAsRead = async (userId: string) => {
    const result = await prisma.notification.updateMany({
      where: { userId, is_read: false },
      data: { is_read: true },
    });
    return { count: result.count };
  };
}
