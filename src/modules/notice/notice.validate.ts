import { z } from 'zod';

const noticeCategoryEnum = z.enum([
  'MAINTENANCE',
  'EMERGENCY',
  'COMMUNITY',
  'RESIDENT_VOTE',
  'RESIDENT_COUNCIL',
  'ETC',
]);

export const createNoticeSchema = z.object({
  category: noticeCategoryEnum,
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(5000),
  boardId: z.string().uuid(),
  isPinned: z.boolean().optional().default(false),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type CreateNoticeInput = z.infer<typeof createNoticeSchema>;

export const updateNoticeSchema = z.object({
  category: noticeCategoryEnum.optional(),
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().trim().min(1).max(5000).optional(),
  boardId: z.string().uuid().optional(),
  isPinned: z.boolean().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  userId: z.string().uuid(),
});

export type UpdateNoticeInput = z.infer<typeof updateNoticeSchema>;

export const noticeIdSchema = z.object({
  noticeId: z.string().uuid(),
});

export const getNoticesQuerySchema = z.object({
  page: z.preprocess((v) => Number(v), z.number().int().min(1).optional().default(1)),
  limit: z.preprocess((v) => Number(v), z.number().int().min(1).max(100).optional().default(11)),
  category: noticeCategoryEnum.optional(),
  search: z.string().trim().optional(),
});

export type GetNoticesQuery = z.infer<typeof getNoticesQuerySchema>;
