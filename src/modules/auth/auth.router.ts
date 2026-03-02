import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler';
import { authController } from './auth.controller';

const router = express.Router();

router.post('/signup', asyncHandler(authController.signup));
router.post('/signup/admin', asyncHandler(authController.signupAdmin));
router.post('/signup/super-admin', asyncHandler(authController.signupSuperAdmin));

export default router;
