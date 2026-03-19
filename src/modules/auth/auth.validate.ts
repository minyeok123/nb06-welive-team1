import { z } from 'zod';

export const signupSchema = z.object({
  username: z.string().trim().min(2).max(30),
  password: z.string().min(8).max(100),
  contact: z
    .string()
    .trim()
    .refine((val) => !val.includes('-'), {
      message: '하이픈(-)을 제외한 숫자만 입력해 주세요.',
    })
    .regex(/^\d{9,11}$/, '연락처 형식이 올바르지 않습니다'),
  name: z.string().trim().min(2).max(50),
  email: z.email(),
  role: z.enum(['USER']),
  apartmentName: z.string().trim().min(1),
  apartmentDong: z.coerce.number().int().min(100).max(9999),
  apartmentHo: z.coerce.number().int().min(100).max(9999),
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
  email: z.email(),
  description: z.string().trim().max(1000),
  startComplexNumber: z.coerce.number().int().min(1).max(99),
  endComplexNumber: z.coerce.number().int().min(1).max(99),
  startDongNumber: z.coerce.number().int().min(1).max(99),
  endDongNumber: z.coerce.number().int().min(1).max(99),
  startFloorNumber: z.coerce.number().int().min(1).max(99),
  endFloorNumber: z.coerce.number().int().min(1).max(99),
  startHoNumber: z.coerce.number().int().min(1).max(99),
  endHoNumber: z.coerce.number().int().min(1).max(99),
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
  role: z.enum(['SUPER_ADMIN']),
  joinStatus: z.enum(['APPROVED']),
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
  email: z.email().optional(),
  description: z.string().trim().max(1000).optional(),
  apartmentName: z.string().trim().min(1, '아파트 이름은 필수입니다').optional(),
  apartmentAddress: z.string().trim().min(1, '아파트 주소는 필수입니다').optional(),
  apartmentManagementNumber: z
    .string()
    .trim()
    .regex(/^\d{5,15}$/, '관리번호 형식이 올바르지 않습니다')
    .optional(),
});
