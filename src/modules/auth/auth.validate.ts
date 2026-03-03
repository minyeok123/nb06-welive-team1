<<<<<<< HEAD
import { z } from 'zod';

export const signupSchema = z
  .object({
    username: z.string().trim().min(2).max(30),
    password: z.string().min(8).max(100),
    contact: z.string().trim().regex(/^\d{9,15}$/, '연락처 형식이 올바르지 않습니다'),
    name: z.string().trim().min(2).max(50),
    email: z.string().trim().email(),
    role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']),
    apartmentName: z.string().trim().min(1),
    apartmentDong: z.string().trim().regex(/^\d+$/).optional(),
    apartmentHo: z.string().trim().regex(/^\d+$/).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'USER') {
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
  contact: z.string().trim().regex(/^\d{9,15}$/, '연락처 형식이 올바르지 않습니다'),
  name: z.string().trim().min(2).max(50),
  email: z.string().trim().email(),
  description: z.string().trim().max(1000).optional(),
  startComplexNumber: z.string().trim().regex(/^\d+$/),
  endComplexNumber: z.string().trim().regex(/^\d+$/),
  startDongNumber: z.string().trim().regex(/^\d+$/),
  endDongNumber: z.string().trim().regex(/^\d+$/),
  startFloorNumber: z.string().trim().regex(/^\d+$/),
  endFloorNumber: z.string().trim().regex(/^\d+$/),
  startHoNumber: z.string().trim().regex(/^\d+$/),
  endHoNumber: z.string().trim().regex(/^\d+$/),
  role: z.literal('ADMIN'),
  apartmentName: z.string().trim().min(1),
  apartmentAddress: z.string().trim().min(1),
  apartmentManagementNumber: z.string().trim().regex(/^\d{5,15}$/),
});

export type AdminSignupInput = z.infer<typeof adminSignupSchema>;

export const superAdminSignupSchema = z.object({
  username: z.string().trim().min(2).max(30),
  password: z.string().min(8).max(100),
  contact: z.string().trim().regex(/^\d{9,15}$/, '연락처 형식이 올바르지 않습니다'),
  name: z.string().trim().min(2).max(50),
  email: z.string().trim().email(),
  role: z.literal('SUPER_ADMIN'),
  joinStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});

export type SuperAdminSignupInput = z.infer<typeof superAdminSignupSchema>;
=======
import z from 'zod';
>>>>>>> 76a8dbb (로그인,로그아웃,토큰갱신 비지니스 로직 개발)
