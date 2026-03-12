import { z } from 'zod';

export const getResidentListQuerySchema = z.object({
  page: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce.number().int().positive().default(1),
  ),
  limit: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce.number().int().max(100).positive().default(20),
  ),
  building: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce.number().int().positive().optional(),
  ),
  unitNumber: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce.number().int().positive().optional(),
  ),
  residenceStatus: z.preprocess((v) => {
    if (v === '' || v === undefined) return undefined;
    if (v === 'RESIDENCE') return true;
    if (v === 'NO_RESIDENCE') return false;
    return v;
  }, z.boolean().optional()),
  isRegistered: z.preprocess((v) => {
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (v === '' || v === undefined) return undefined;
    return v;
  }, z.boolean().optional()),
  keyword: z.preprocess((v) => (v === '' ? undefined : v), z.string().optional()),
});
