import { z } from 'zod';

export const createComplaintSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(5000),
  isPublic: z.boolean(), // 공개 여부
  boardId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']).optional(),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
