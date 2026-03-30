import { aptController } from '@modules/apartment/apt.controller';
import express from 'express';
import asyncHandler from '@middlewares/asyncHandler';
import { validate } from '@middlewares/validate';
import {
  getListAptForSignupQuerySchema,
  getListAptQuerySchema,
  getAptDetailParamSchema,
} from '@modules/apartment/apt.validate';
import { authenticate } from '@middlewares/authenticate';
import { isNotUser } from '@middlewares/authorize';

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
router.get(
  '/:id',
  authenticate,
  isNotUser,
  validate(getAptDetailParamSchema, 'params'),
  asyncHandler(aptController.getAptDetail),
);

router.get(
  '/public/:id',
  validate(getAptDetailParamSchema, 'params'),
  asyncHandler(aptController.getAptDetailPublic),
);

export default router;
