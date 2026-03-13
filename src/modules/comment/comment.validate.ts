import { z } from 'zod';

<<<<<<< HEAD
const boardTypeEnum = z.enum(['NOTICE', 'COMPLAINT']);

export const CommentSchema = z.object({
  content: z.string().trim().min(1).max(1000),
  boardType: boardTypeEnum,
  boardId: z.uuid(),
});

export const commentIdSchema = z.object({
  commentId: z.uuid(),
=======
const boardTypeEnum = z.enum(['NOTICE', 'POLL', 'COMPLAINT']);

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(1000),
  boardType: boardTypeEnum,
  boardId: z.string().uuid(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
  content: z.string().trim().min(1).max(1000),
  boardType: boardTypeEnum,
  boardId: z.string().uuid(),
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;

export const commentIdSchema = z.object({
  commentId: z.string().uuid(),
>>>>>>> d23110f (feat: Notice, Comment 모듈 구현 (스키마 변경 반영))
});
