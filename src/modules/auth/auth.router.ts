import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler';
import { authController } from './auth.controller';
import { authenticateRefresh } from './utils/refresh.middlewares';

const router = express.Router();

router.post('/signup', asyncHandler(authController.signup));
router.post('/signup/admin', asyncHandler(authController.signupAdmin));
router.post('/signup/super-admin', asyncHandler(authController.signupSuperAdmin));
router.post('/login', asyncHandler(authController.login));
router.post('/refresh', authenticateRefresh, asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));

export default router;
