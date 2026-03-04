import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler';
import { authController } from './auth.controller';
import { authenticateRefresh } from './utils/refresh.middlewares';
import { validate } from '../../middlewares/validate';
import {
  loginSchema,
  adminIdSchema,
  residentIdSchema,
  updateRegisterStatusSchema,
} from './auth.validate';
import { authenticate } from '@/middlewares/authenticate';
import { superAdminAuthorize, adminAuthorize } from '@/middlewares/authorize';

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
  validate(updateRegisterStatusSchema, 'body'),
  authenticate,
  superAdminAuthorize,
  asyncHandler(authController.updateAdminStatus),
);
router.patch(
  '/residents/:residentId/status',
  validate(residentIdSchema, 'params'),
  validate(updateRegisterStatusSchema, 'body'),
  authenticate,
  adminAuthorize,
  asyncHandler(authController.updateResidentStatus),
);
export default router;
