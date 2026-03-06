import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler';
import { validate } from '../../middlewares/validate';
import { changePasswordSchema, updateProfileSchema } from './user.validate';
import { authenticate } from '../../middlewares/authenticate';
import { userController } from './user.controller';
import { uploadProfile } from './utils/uploads';

const router = express.Router();

router.patch(
  '/password',
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(userController.changePassword),
);

router.patch(
  '/me',
  uploadProfile.single('file'),
  authenticate,
  validate(updateProfileSchema),
  asyncHandler(userController.updateProfile),
);

export default router;
