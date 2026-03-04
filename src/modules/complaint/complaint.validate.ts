import { z } from 'zod';

const pageSchema = z.coerce.number().int().min(1).default(1);
const limitSchema = z.coerce.number().int().min(1).max(100).default(20);
const booleanSchema = z.preprocess((value) => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
}, z.boolean());

export const createComplaintSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(5000),
  isPublic: z.boolean(), // 공개 여부
  boardId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']).optional(),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;

export const listComplaintsSchema = z.object({
  page: pageSchema.optional(),
  limit: limitSchema.optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE', 'RESOLVED', 'REJECTED']).optional(),
  isPublic: booleanSchema.optional(),
  dong: z.coerce.number().int().optional(),
  ho: z.coerce.number().int().optional(),
  keyword: z.string().trim().min(1).optional(),
});

export type ListComplaintsQuery = z.infer<typeof listComplaintsSchema>;
