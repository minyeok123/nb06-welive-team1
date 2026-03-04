import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler';
import { authController } from './auth.controller';
import { authenticateRefresh } from './utils/refresh.middlewares';
import { validate } from '../../middlewares/validate';
import { loginSchema, adminIdSchema, updateAdminStatusSchema } from './auth.validate';

const router = express.Router();

router.post('/signup', asyncHandler(authController.signup));
router.post('/signup/admin', asyncHandler(authController.signupAdmin));
router.post('/signup/super-admin', asyncHandler(authController.signupSuperAdmin));
router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', authenticateRefresh, asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));
router.patch(
  '/admins/:adminId/status',
  validate(adminIdSchema, 'params'),
  validate(updateAdminStatusSchema, 'body'),
  asyncHandler(authController.updateAdminStatus),
);

export default router;
