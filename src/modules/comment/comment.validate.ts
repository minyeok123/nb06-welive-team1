import { z } from 'zod';

const boardTypeEnum = z.enum(['NOTICE', 'COMPLAINT']);

export const CommentSchema = z.object({
  content: z.string().trim().min(1).max(1000),
  boardType: boardTypeEnum,
  boardId: z.uuid(),
});

export const commentIdSchema = z.object({
  commentId: z.uuid(),
});
