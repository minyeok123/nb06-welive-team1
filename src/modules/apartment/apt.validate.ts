import { z } from 'zod';

export const aptQuerySchema = z.object({
  keyword: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(20).optional(),
  adress: z.string().min(1).max(20).optional(),
});
