import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler';
import { authController } from './auth.controller';
import { authenticateRefresh } from './utils/refresh.middlewares';
import { validate } from '../../middlewares/validate';
import { loginSchema, registerIdSchema, updateRegisterStatusSchema } from './auth.validate';
import { authenticate } from '@/middlewares/authenticate';
import { superAdminAuthorize } from '@/middlewares/authorize';

const router = express.Router();

router.post('/signup', asyncHandler(authController.signup));
router.post('/signup/admin', asyncHandler(authController.signupAdmin));
router.post('/signup/super-admin', asyncHandler(authController.signupSuperAdmin));
router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', authenticateRefresh, asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));
router.patch(
  '/admins/:adminId/status',
  validate(registerIdSchema, 'params'),
  validate(updateRegisterStatusSchema, 'body'),
  authenticate,
  superAdminAuthorize,
  asyncHandler(authController.updateAdminStatus),
);
router.patch(
  '/reisents/:residentId/status',
  validate(registerIdSchema, 'params'),
  validate(updateRegisterStatusSchema, 'body'),
  authenticate,
  superAdminAuthorize,
  asyncHandler(authController.updateResidentStatus),
);
export default router;
