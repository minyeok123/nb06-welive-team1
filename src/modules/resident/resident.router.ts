import { Router } from 'express';
import { residentController } from './resident.controller';
import asyncHandler from '../../middlewares/asyncHandler';
import { authenticate } from '@/middlewares/authenticate';
import { adminAuthorize } from '@/middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { getResidentListQuerySchema } from './resident.validate';

const router = Router();

router.get(
  '/',
  authenticate,
  adminAuthorize,
  validate(getResidentListQuerySchema, 'query'),
  asyncHandler(residentController.getResidentList),
);

export default router;
