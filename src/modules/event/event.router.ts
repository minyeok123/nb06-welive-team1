import express from 'express';
import asyncHandler from '@/middlewares/asyncHandler';
import { validate } from '@/middlewares/validate';
import { authenticate } from '@/middlewares/authenticate';
import { listEventsQuerySchema } from './event.validate';
import { eventController } from './event.controller';

const router = express.Router();

// 이벤트 목록 조회 (연도·월 기준 아파트 공지·투표)
router.get(
  '/',
  authenticate,
  validate(listEventsQuerySchema, 'query'),
  asyncHandler(eventController.listEvents),
);

export default router;
