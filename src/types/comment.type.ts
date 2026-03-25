import { BoardType } from '@prisma/client';

export interface CommentType {
  content: string;
  boardType: BoardType;
  boardId: string;
}

export interface CommentIdInput {
  commentId: string;
}

export type CreateCommentType = CommentType;
export type UpdateCommentType = CommentType;
