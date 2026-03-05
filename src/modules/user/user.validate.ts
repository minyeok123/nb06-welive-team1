import { z } from 'zod';

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(20),
  newPassword: z.string().min(8).max(20),
});
