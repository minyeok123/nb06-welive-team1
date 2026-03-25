import { z } from 'zod';

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(20),
  newPassword: z.string().min(8).max(20),
});

export const updateProfileSchema = z
  .object({
    currentPassword: z.string().min(8).max(20).optional(),
    newPassword: z.string().min(8).max(20).optional(),
  })
  .refine((data) => {
    if (!data.currentPassword && !data.newPassword) return true;
    if (data.currentPassword && data.newPassword) return true;
    return false;
  });
