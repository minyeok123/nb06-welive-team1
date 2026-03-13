import { Router } from 'express';
import { residentController } from './resident.controller';
import asyncHandler from '../../middlewares/asyncHandler';
import { authenticate } from '@/middlewares/authenticate';
import { adminAuthorize } from '@/middlewares/authorize';
import { validate } from '../../middlewares/validate';
import {
  getResidentListQuerySchema,
  createRosterBodySchema,
  getRosterDetailParamsSchema,
  patchRosterBodySchema,
} from './resident.validate';

const router = Router();

router.get(
  '/',
  authenticate,
  adminAuthorize,
  validate(getResidentListQuerySchema, 'query'),
  asyncHandler(residentController.getResidentList),
);
router.post(
  '/',
  authenticate,
  adminAuthorize,
  validate(createRosterBodySchema, 'body'),
  asyncHandler(residentController.createRoster),
);
router.get(
  '/:id',
  authenticate,
  adminAuthorize,
  validate(getRosterDetailParamsSchema, 'params'),
  asyncHandler(residentController.getRosterDetail),
);
router.patch(
  '/:id',
  authenticate,
  adminAuthorize,
  validate(getRosterDetailParamsSchema, 'params'),
  validate(patchRosterBodySchema, 'body'),
  asyncHandler(residentController.patchRoster),
);

export default router;
