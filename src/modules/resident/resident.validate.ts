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

export const createRosterBodySchema = z.object({
  building: z.coerce.number().int().positive(),
  unitNumber: z.coerce.number().int().positive(),
  contact: z
    .string()
    .trim()
    .regex(/^\d{9,11}$/, '연락처 형식이 올바르지 않습니다'),
  name: z
    .string()
    .min(1, '이름은 1자 이상 5자 이하여야 합니다.')
    .max(5, '이름은 1자 이상 5자 이하여야 합니다.'),
  isHouseholder: z.enum(['HOUSEHOLDER', 'MEMBER']),
});

export const RosterIdParamsSchema = z.object({
  id: z.uuid('ID 형식이 올바르지 않습니다'),
});

export const patchRosterBodySchema = createRosterBodySchema.partial();

export const createRosterFromUserParamsSchema = z.object({
  userId: z.uuid('ID 형식이 올바르지 않습니다'),
});
