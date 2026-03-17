import { z } from 'zod';

export const getListAptForSignupQuerySchema = z.object({
  keyword: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(20).optional(),
  address: z.string().min(1).max(20).optional(),
});

export const getListAptQuerySchema = z.object({
  name: z.preprocess((v) => (v === '' ? undefined : v), z.string().optional()),
  address: z.preprocess((v) => (v === '' ? undefined : v), z.string().optional()),
  searchKeyword: z.preprocess((v) => (v === '' ? undefined : v), z.string().optional()),
  apartmentStatus: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  ),
  page: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce.number().int().positive().default(1),
  ),
  limit: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce.number().int().max(100).positive().default(10),
  ),
});

export const getAptDetailParamSchema = z.object({
  id: z.uuid(),
});
