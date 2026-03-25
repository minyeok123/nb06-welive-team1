import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler';
import { authController } from './auth.controller';
import { authenticateRefresh } from './utils/refresh.middlewares';
import { validate } from '../../middlewares/validate';
import {
  loginSchema,
  signupSchema,
  adminIdSchema,
  residentIdSchema,
  updateRegisterStatusSchema,
  superAdminSignupSchema,
  adminUpdateSchema,
  adminSignupSchema,
} from './auth.validate';
import { authenticate } from '@/middlewares/authenticate';
import { superAdminAuthorize, adminAuthorize, isNotUser } from '@/middlewares/authorize';

const router = express.Router();

router.post('/signup', validate(signupSchema, 'body'), asyncHandler(authController.signup));
router.post(
  '/signup/admin',
  validate(adminSignupSchema, 'body'),
  asyncHandler(authController.signupAdmin),
);
router.post(
  '/signup/super-admin',
  validate(superAdminSignupSchema, 'body'),
  asyncHandler(authController.signupSuperAdmin),
);
router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', authenticateRefresh, asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));
router.patch(
  '/admins/status',
  authenticate,
  superAdminAuthorize,
  validate(updateRegisterStatusSchema, 'body'),
  asyncHandler(authController.updateAdminsStatusBatch),
);
router.patch(
  '/admins/:adminId/status',
  authenticate,
  superAdminAuthorize,
  validate(adminIdSchema, 'params'),
  validate(updateRegisterStatusSchema, 'body'),
  asyncHandler(authController.updateAdminStatus),
);
router.patch(
  '/residents/status',
  authenticate,
  adminAuthorize,
  validate(updateRegisterStatusSchema, 'body'),
  asyncHandler(authController.updateResidentsStatusBatch),
);
router.patch(
  '/residents/:residentId/status',
  authenticate,
  adminAuthorize,
  validate(residentIdSchema, 'params'),
  validate(updateRegisterStatusSchema, 'body'),
  asyncHandler(authController.updateResidentStatus),
);
router.patch(
  '/admins/:adminId',
  validate(adminIdSchema, 'params'),
  validate(adminUpdateSchema, 'body'),
  authenticate,
  superAdminAuthorize,
  asyncHandler(authController.updateAdmin),
);
router.delete(
  '/admins/:adminId',
  validate(adminIdSchema, 'params'),
  authenticate,
  superAdminAuthorize,
  asyncHandler(authController.deleteApartment),
);
router.post('/cleanup', authenticate, isNotUser, asyncHandler(authController.cleanup));
export default router;
