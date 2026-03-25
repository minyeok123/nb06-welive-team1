import { BoardType } from '@prisma/client';

export interface CommentResponseDto {
  comment: {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    writerName: string;
  };
  board: {
    id: string;
    boardType: BoardType;
  };
}

export interface ComplaintCommentWithUser {
  id: string;
  userId: string;
  complaintId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    name: string;
  };
}

export interface NoticeCommentWithUser {
  id: string;
  userId: string;
  noticeId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    name: string;
  };
}

export const commentResponseDto = (
  comment: ComplaintCommentWithUser | NoticeCommentWithUser,
): CommentResponseDto => {
  const isComplaint = 'complaintId' in comment;
  const boardId = isComplaint ? comment.complaintId : comment.noticeId;
  const boardType = isComplaint ? BoardType.COMPLAINT : BoardType.NOTICE;

  return {
    comment: {
      id: comment.id,
      userId: comment.userId,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      writerName: comment.user.name,
    },
    board: {
      id: boardId,
      boardType: boardType,
    },
  };
};
