import { prisma } from '@libs/prisma';

export class CommentRepo {
  findComplaintById = async (id: string) => {
    return await prisma.complaint.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        board: {
          select: { id: true, aptId: true, boardType: true },
        },
      },
    });
  };

  findNoticeById = async (id: string) => {
    return await prisma.notice.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        board: {
          select: { id: true, aptId: true, boardType: true },
        },
      },
    });
  };

  createComplaintComment = async (data: {
    userId: string;
    complaintId: string;
    content: string;
  }) => {
    return await prisma.complaintComment.create({
      data,
      select: {
        id: true,
        userId: true,
        complaintId: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { name: true } },
      },
    });
  };

  findComplaintCommentById = async (id: string) => {
    return await prisma.complaintComment.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        userId: true,
        complaintId: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { name: true } },
        complaint: {
          select: {
            board: {
              select: { aptId: true },
            },
          },
        },
      },
    });
  };

  updateComplaintComment = async (id: string, content: string) => {
    return await prisma.complaintComment.update({
      where: { id, deletedAt: null },
      data: { content },
      select: {
        id: true,
        userId: true,
        complaintId: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { name: true } },
      },
    });
  };

  deleteComplaintComment = async (id: string) => {
    return await prisma.complaintComment.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  };

  createNoticeComment = async (params: { userId: string; noticeId: string; content: string }) => {
    return await prisma.noticeComment.create({
      data: params,
      select: {
        id: true,
        userId: true,
        noticeId: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { name: true } },
      },
    });
  };

  findNoticeCommentById = async (id: string) => {
    return await prisma.noticeComment.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        userId: true,
        noticeId: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { name: true } },
        notice: {
          select: {
            board: {
              select: { aptId: true },
            },
          },
        },
      },
    });
  };

  updateNoticeComment = async (id: string, content: string) => {
    return await prisma.noticeComment.update({
      where: { id, deletedAt: null },
      data: { content },
      select: {
        id: true,
        userId: true,
        noticeId: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { name: true } },
      },
    });
  };

  deleteNoticeComment = async (id: string) => {
    return await prisma.noticeComment.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  };
}
