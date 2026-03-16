import { z } from 'zod';

const intValue = z.preprocess((value) => Number(value), z.number().int());
const optionalIntValue = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return Number(value);
}, z.number().int());

export const signupSchema = z
  .object({
    username: z.string().trim().min(2).max(30),
    password: z.string().min(8).max(100),
    contact: z
      .string()
      .trim()
      .regex(/^\d{9,15}$/, '연락처 형식이 올바르지 않습니다'),
    name: z.string().trim().min(2).max(50),
    email: z.string().trim().email(),
    role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']),
    apartmentName: z.string().trim().min(1).optional(),
    apartmentAddress: z.string().trim().min(1).optional(),
    apartmentDong: optionalIntValue.optional(),
    apartmentHo: optionalIntValue.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'USER') {
      if (!data.apartmentAddress && !data.apartmentName) {
        ctx.addIssue({
          code: 'custom',
          path: ['apartmentAddress'],
          message: '아파트 주소 또는 이름이 필요합니다',
        });
      }
      if (!data.apartmentDong) {
        ctx.addIssue({
          code: 'custom',
          path: ['apartmentDong'],
          message: '동 정보가 필요합니다',
        });
      }
      if (!data.apartmentHo) {
        ctx.addIssue({
          code: 'custom',
          path: ['apartmentHo'],
          message: '호 정보가 필요합니다',
        });
      }
    }
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const adminSignupSchema = z.object({
  username: z.string().trim().min(2).max(30),
  password: z.string().min(8).max(100),
  contact: z
    .string()
    .trim()
    .regex(/^\d{9,15}$/, '연락처 형식이 올바르지 않습니다'),
  name: z.string().trim().min(2).max(50),
  email: z.string().trim().email(),
  description: z.string().trim().max(1000),
  startComplexNumber: intValue,
  endComplexNumber: intValue,
  startDongNumber: intValue,
  endDongNumber: intValue,
  startFloorNumber: intValue,
  endFloorNumber: intValue,
  startHoNumber: intValue,
  endHoNumber: intValue,
  role: z.literal('ADMIN'),
  apartmentName: z.string().trim().min(1),
  apartmentAddress: z.string().trim().min(1),
  apartmentManagementNumber: z
    .string()
    .trim()
    .regex(/^\d{5,15}$/),
});

export type AdminSignupInput = z.infer<typeof adminSignupSchema>;

export const superAdminSignupSchema = z.object({
  username: z.string().trim().min(2).max(30),
  password: z.string().min(8).max(100),
  contact: z
    .string()
    .trim()
    .regex(/^\d{9,15}$/, '연락처 형식이 올바르지 않습니다'),
  name: z.string().trim().min(2).max(50),
  email: z.string().trim().email(),
  role: z.literal('SUPER_ADMIN'),
});

export type SuperAdminSignupInput = z.infer<typeof superAdminSignupSchema>;

export const loginSchema = z.object({
  username: z.string(),
  password: z.string().min(8).max(15),
});

export const updateRegisterStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});

export const adminIdSchema = z.object({
  adminId: z.uuid(),
});

export const residentIdSchema = z.object({
  residentId: z.uuid(),
});

export const updateAdminsStatusBatchSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, '최소 1개 이상의 ID가 필요합니다'),
  status: z.enum(['APPROVED', 'REJECTED']),
});

export const updateResidentsStatusBatchSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, '최소 1개 이상의 ID가 필요합니다'),
  status: z.enum(['APPROVED', 'REJECTED']),
});

export const adminUpdateSchema = z.object({
  contact: z
    .string()
    .trim()
    .regex(/^\d{9,11}$/, '연락처 형식이 올바르지 않습니다')
    .optional(),
  name: z.string().trim().min(2).max(50).optional(),
  email: z.string().trim().email().optional(),
  description: z.string().trim().max(1000).optional(),
  apartmentName: z.string().trim().min(1, '아파트 이름은 필수입니다').optional(),
  apartmentAddress: z.string().trim().min(1, '아파트 주소는 필수입니다').optional(),
  apartmentManagementNumber: z
    .string()
    .trim()
    .regex(/^\d{5,15}$/, '관리번호 형식이 올바르지 않습니다')
    .optional(),
});
