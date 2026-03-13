import { prisma } from '@libs/prisma';

export class CommentRepo {
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
      },
    });
  };

  findCommentById = async (id: string) => {
    return prisma.comment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        board: { select: { id: true, aptId: true, boardType: true } },
      },
    });
  };

  updateComment = async (id: string, content: string) => {
    return prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        user: { select: { id: true, name: true } },
        board: { select: { id: true, boardType: true } },
      },
    });
  };

  deleteComment = async (id: string) => {
    return prisma.comment.delete({
      where: { id },
    });
  };
}
