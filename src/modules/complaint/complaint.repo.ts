import { prisma } from '@libs/prisma';
import { IsPublic, NotificationType, Prisma, Status } from '@prisma/client';

export class ComplaintRepo {
  createComplaintWithBoard = async (params: {
    authorId: string;
    title: string;
    content: string;
    status: Status;
    isPublic: boolean;
    boardId?: string;
  }) => {
    return prisma.$transaction(async (tx) => {
      // 게시판 생성 후 민원과 연결
      const board = await tx.board.create({
        data: {
          id: params.boardId,
          authorId: params.authorId,
          boardType: 'COMPLAINT',
        },
      });

      const complaint = await tx.complaint.create({
        data: {
          boardId: board.id,
          authorId: params.authorId,
          title: params.title,
          content: params.content,
          status: params.status,
          is_public: params.isPublic ? IsPublic.PUBLIC : IsPublic.PRIVATE,
        },
      });

      return { board, complaint };
    });
  };

  findAdminsByApartment = async (aptId: string) => {
    return prisma.user.findMany({
      where: {
        aptId,
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
      },
      select: {
        id: true,
      },
    });
  };

  createComplaintNotifications = async (params: {
    boardId: string;
    complaintId: string;
    userIds: string[];
    message: string;
  }) => {
    if (params.userIds.length === 0) {
      return { count: 0 };
    }

    // 관리자 알림 다건 생성
    return prisma.notification.createMany({
      data: params.userIds.map((userId) => ({
        userId,
        boardId: params.boardId,
        message: params.message,
        notificationType: NotificationType.COMPLAINT_REQ,
        complaintId: params.complaintId,
      })),
    });
  };

  findComplaints = async (params: {
    where: Prisma.ComplaintWhereInput;
    skip: number;
    take: number;
  }) => {
    const [items, totalCount] = await prisma.$transaction([
      prisma.complaint.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          board: {
            select: {
              author: {
                select: {
                  id: true,
                  name: true,
                  aptId: true,
                  resident: {
                    select: {
                      dong: true,
                      ho: true,
                    },
                  },
                },
              },
              _count: {
                select: {
                  comments: true,
                },
              },
            },
          },
        },
      }),
      prisma.complaint.count({ where: params.where }),
    ]);

    return { items, totalCount };
  };
}
