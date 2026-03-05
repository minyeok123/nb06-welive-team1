import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler';
import { validate } from '../../middlewares/validate';
import { changePasswordSchema } from './user.validate';
import { authenticate } from '../../middlewares/authenticate';
import { userController } from './user.controller';

const router = express.Router();

router.patch(
  '/password',
  validate(changePasswordSchema),
  authenticate,
  asyncHandler(userController.changePassword),
);

export default router;
