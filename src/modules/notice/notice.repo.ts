import { prisma } from '@libs/prisma';
import { NoticeCategory, Prisma } from '@prisma/client';

export class NoticeRepo {
  createNotice = async (params: {
    boardId: string;
    authorId: string;
    title: string;
    content: string;
    category: NoticeCategory;
    isPinned: boolean;
    startDate?: Date;
    endDate?: Date;
  }) => {
    return prisma.notice.create({
      data: {
        boardId: params.boardId,
        authorId: params.authorId,
        title: params.title,
        content: params.content,
        category: params.category,
        is_pinned: params.isPinned,
        startDate: params.startDate,
        endDate: params.endDate,
      },
    });
  };

  findBoardById = async (id: string) => {
    return prisma.board.findUnique({
      where: { id },
    });
  };

  findNotices = async (params: {
    aptId?: string;
    category?: NoticeCategory;
    search?: string;
    page: number;
    limit: number;
  }) => {
    const where: Prisma.NoticeWhereInput = {
      deletedAt: null,
    };

    if (params.aptId) {
      where.board = { aptId: params.aptId };
    }

    if (params.category) {
      where.category = params.category;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { content: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [notices, totalCount] = await Promise.all([
      prisma.notice.findMany({
        where,
        include: {
          author: { select: { name: true } },
          board: {
            select: {
              id: true,
              boardType: true,
<<<<<<< HEAD
            },
          },
          _count: { select: { noticeComment: true } },
=======
              _count: { select: { comments: true } },
            },
          },
>>>>>>> d23110f (feat: Notice, Comment 모듈 구현 (스키마 변경 반영))
        },
        orderBy: [{ is_pinned: 'desc' }, { createdAt: 'desc' }],
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.notice.count({ where }),
    ]);

    return { notices, totalCount };
  };

  findNoticeById = async (id: string) => {
    return prisma.notice.findUnique({
      where: { id, deletedAt: null },
      include: {
        author: { select: { id: true, name: true } },
        board: {
          select: {
            id: true,
            aptId: true,
            boardType: true,
<<<<<<< HEAD
          },
        },
        noticeComment: {
          where: { deletedAt: null },
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'asc' } as const,
        },
=======
            comments: {
              include: {
                user: { select: { id: true, name: true } },
              },
              orderBy: { createdAt: 'asc' } as const,
            },
          },
        },
>>>>>>> d23110f (feat: Notice, Comment 모듈 구현 (스키마 변경 반영))
      },
    });
  };

  incrementViewsCount = async (id: string) => {
    return prisma.notice.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });
  };

  updateNotice = async (
    id: string,
    data: Prisma.NoticeUpdateInput,
  ) => {
    return prisma.notice.update({
      where: { id },
      data,
    });
  };

  softDeleteNotice = async (id: string) => {
    return prisma.notice.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  };

  findUsersByApartment = async (aptId: string) => {
    return prisma.user.findMany({
      where: { aptId, deletedAt: null },
      select: { id: true },
    });
  };

  createNoticeNotifications = async (params: {
    boardId: string;
    noticeId: string;
    userIds: string[];
    message: string;
  }) => {
    if (params.userIds.length === 0) return { count: 0 };

    return prisma.notification.createMany({
      data: params.userIds.map((userId) => ({
        userId,
        boardId: params.boardId,
        message: params.message,
        notificationType: 'NOTICE_REG' as const,
        noticeId: params.noticeId,
        notificatedAt: new Date(),
      })),
    });
  };
}
