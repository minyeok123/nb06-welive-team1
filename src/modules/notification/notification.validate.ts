import { z } from 'zod';

export const notificationIdSchema = z.object({
  notificationId: z.string().uuid(),
});

export const getNotificationsQuerySchema = z.object({
  page: z.preprocess((v) => Number(v), z.number().int().min(1).optional().default(1)),
  limit: z.preprocess((v) => Number(v), z.number().int().min(1).max(50).optional().default(20)),
  isRead: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
});

export type GetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>;
