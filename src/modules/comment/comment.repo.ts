import { prisma } from '@libs/prisma';

export class CommentRepo {
<<<<<<< HEAD
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
      where: { id },
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
=======
  findBoardById = async (id: string) => {
    return prisma.board.findUnique({
      where: { id },
    });
  };

  createComment = async (params: {
    userId: string;
    boardId: string;
    content: string;
  }) => {
    return prisma.comment.create({
      data: {
        userId: params.userId,
        boardId: params.boardId,
        content: params.content,
      },
      include: {
        user: { select: { id: true, name: true } },
        board: { select: { id: true, boardType: true } },
>>>>>>> d23110f (feat: Notice, Comment 모듈 구현 (스키마 변경 반영))
      },
    });
  };

<<<<<<< HEAD
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
=======
  findCommentById = async (id: string) => {
    return prisma.comment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        board: { select: { id: true, aptId: true, boardType: true } },
>>>>>>> d23110f (feat: Notice, Comment 모듈 구현 (스키마 변경 반영))
      },
    });
  };

<<<<<<< HEAD
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
=======
  updateComment = async (id: string, content: string) => {
    return prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        user: { select: { id: true, name: true } },
        board: { select: { id: true, boardType: true } },
>>>>>>> d23110f (feat: Notice, Comment 모듈 구현 (스키마 변경 반영))
      },
    });
  };

<<<<<<< HEAD
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
=======
  deleteComment = async (id: string) => {
    return prisma.comment.delete({
      where: { id },
>>>>>>> d23110f (feat: Notice, Comment 모듈 구현 (스키마 변경 반영))
    });
  };
}
