import { Router } from 'express';
import { residentController } from './resident.controller';
import { uploadCsv } from './utils/uploads';
import asyncHandler from '../../middlewares/asyncHandler';
import { authenticate } from '@/middlewares/authenticate';
import { adminAuthorize } from '@/middlewares/authorize';
import { validate } from '../../middlewares/validate';
import {
  getResidentListQuerySchema,
  createRosterBodySchema,
  RosterIdParamsSchema,
  patchRosterBodySchema,
  createRosterFromUserParamsSchema,
} from './resident.validate';

const router = Router();

router.get(
  '/',
  authenticate,
  adminAuthorize,
  validate(getResidentListQuerySchema, 'query'),
  asyncHandler(residentController.getRosterList),
);
router.post(
  '/',
  authenticate,
  adminAuthorize,
  validate(createRosterBodySchema, 'body'),
  asyncHandler(residentController.createRoster),
);

router.post(
  '/from-file',
  authenticate,
  adminAuthorize,
  uploadCsv.single('file'),
  asyncHandler(residentController.createRostersFromCsv),
);

/** 
실제로 받는 Id 의 값은 RegisterId, API 명세에 맞추기 위해 userID 파라미터로 받음.   
**/
router.post(
  '/from-user/:userId',
  authenticate,
  adminAuthorize,
  validate(createRosterFromUserParamsSchema, 'params'),
  asyncHandler(residentController.createRosterFromUser),
);
router.get(
  '/file/template',
  authenticate,
  adminAuthorize,
  asyncHandler(residentController.getFileTemplate),
);
router.get(
  '/file',
  authenticate,
  adminAuthorize,
  validate(getResidentListQuerySchema, 'query'),
  asyncHandler(residentController.getFileRosterList),
);
router.get(
  '/:id',
  authenticate,
  adminAuthorize,
  validate(RosterIdParamsSchema, 'params'),
  asyncHandler(residentController.getRosterDetail),
);
router.patch(
  '/:id',
  authenticate,
  adminAuthorize,
  validate(RosterIdParamsSchema, 'params'),
  validate(patchRosterBodySchema, 'body'),
  asyncHandler(residentController.patchRoster),
);
router.delete(
  '/:id',
  authenticate,
  adminAuthorize,
  validate(RosterIdParamsSchema, 'params'),
  asyncHandler(residentController.softDeleteRoster),
);

export default router;
