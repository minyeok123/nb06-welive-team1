import { aptController } from '@modules/apartment/apt.controller';
import express from 'express';
import asyncHandler from '@/middlewares/asyncHandler';
import { validate } from '@/middlewares/validate';
import { aptQuerySchema } from '@/modules/apartment/apt.validate';

const router = express.Router();

router.get('/public', validate(aptQuerySchema, 'query'), asyncHandler(aptController.getListApt));

export default router;
