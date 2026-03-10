import { aptController } from '@modules/apartment/apt.controller';
import express from 'express';
import asyncHandler from '@/middlewares/asyncHandler';
import { validate } from '@/middlewares/validate';
import {
  getListAptForSignupQuerySchema,
  getListAptQuerySchema,
} from '@/modules/apartment/apt.validate';
import { authenticate } from '@/middlewares/authenticate';
import { isNotUser } from '@/middlewares/authorize';

const router = express.Router();

router.get(
  '/public',
  validate(getListAptForSignupQuerySchema, 'query'),
  asyncHandler(aptController.getListAptForSignUp),
);
router.get(
  '/',
  authenticate,
  isNotUser,
  validate(getListAptQuerySchema, 'query'),
  asyncHandler(aptController.getListApt),
);

export default router;
