import { z } from 'zod';

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
});
