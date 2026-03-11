import { prisma } from '@libs/prisma';
import { IsPublic, NotificationType, Prisma, Status } from '@prisma/client';

export type ComplaintWithRelations = Prisma.ComplaintGetPayload<{
  include: {
    author: {
      select: {
        id: true;
        name: true;
        aptId: true;
        resident: {
          select: {
            dong: true;
            ho: true;
          };
        };
      };
    };
    board: {
      select: {
        _count: {
          select: {
            comments: true;
          };
        };
      };
    };
  };
}>;

export type ComplaintDetailWithRelations = Prisma.ComplaintGetPayload<{
  include: {
    author: {
      select: {
        id: true;
        name: true;
        aptId: true;
        resident: {
          select: {
            dong: true;
            ho: true;
          };
        };
      };
    };
    board: {
      select: {
        comments: {
          select: {
            id: true;
            userId: true;
            content: true;
            createdAt: true;
            updatedAt: true;
            user: {
              select: {
                name: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export class ComplaintRepo {
  createComplaintWithBoard = async (params: {
    authorId: string;
    aptId: string;
    title: string;
    content: string;
    status: Status;
    isPublic: boolean;
    boardId?: string;
  }) => {
    return prisma.$transaction(async (tx) => {
      // 게시판 생성 후 민원과 연결(같은 트랜잭션)
      const board = await tx.board.create({
        data: {
          id: params.boardId,
          boardType: 'COMPLAINT',
          apartment: { connect: { id: params.aptId } },
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
    // 동일 아파트 관리자 목록 조회
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
      // 알림 대상이 없으면 생성 생략
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
  }): Promise<{ items: ComplaintWithRelations[]; totalCount: number }> => {
    // 민원 목록 + 총 개수 동시 조회
    const [items, totalCount] = await prisma.$transaction([
      prisma.complaint.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          // 작성자(입주민 정보 포함)
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
          // 댓글 수만 필요
          board: {
            select: {
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

  findComplaintById = async (complaintId: string): Promise<ComplaintDetailWithRelations | null> => {
    // 민원 상세(작성자/댓글 포함) 조회
    return prisma.complaint.findFirst({
      where: {
        id: complaintId,
        deletedAt: null,
      },
      include: {
        // 작성자(입주민 정보 포함)
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
        board: {
          select: {
            comments: {
              orderBy: { createdAt: 'asc' },
              select: {
                id: true,
                userId: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  };

  updateComplaint = async (params: {
    complaintId: string;
    title: string;
    content: string;
    isPublic: boolean;
  }): Promise<ComplaintWithRelations> => {
    // 민원 내용 수정
    return prisma.complaint.update({
      where: { id: params.complaintId },
      data: {
        title: params.title,
        content: params.content,
        is_public: params.isPublic ? IsPublic.PUBLIC : IsPublic.PRIVATE,
      },
      include: {
        // 작성자(입주민 정보 포함)
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
        // 댓글 수만 필요
        board: {
          select: {
            _count: {
              select: {
                comments: true,
              },
            },
          },
        },
      },
    });
  };

  updateComplaintStatus = async (params: {
    complaintId: string;
    status: Status;
  }): Promise<ComplaintDetailWithRelations | null> => {
    // 민원 상태 수정
    await prisma.complaint.update({
      where: { id: params.complaintId },
      data: { status: params.status },
    });

    return this.findComplaintById(params.complaintId);
  };

  softDeleteComplaint = async (complaintId: string) => {
    // 민원 소프트 삭제(deletedAt 설정)
    await prisma.complaint.update({
      where: { id: complaintId },
      data: { deletedAt: new Date() },
    });
  };
}
