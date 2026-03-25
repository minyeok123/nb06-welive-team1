import express from 'express';
import asyncHandler from '@/middlewares/asyncHandler';
import { validate } from '@/middlewares/validate';
import { authenticate } from '@/middlewares/authenticate';
import { isNotUser } from '@/middlewares/authorize';
import {
  eventIdParamSchema,
  listEventsQuerySchema,
  putEventQuerySchema,
} from './event.validate';
import { eventController } from './event.controller';

const router = express.Router();

// 이벤트 목록 조회 (연도·월 기준 아파트 공지·투표)
router.get(
  '/',
  authenticate,
  validate(listEventsQuerySchema, 'query'),
  asyncHandler(eventController.listEvents),
);

// 이벤트 생성/수정 (관리자만, NOTICE 또는 POLL 일정)
router.put(
  '/',
  authenticate,
  isNotUser,
  validate(putEventQuerySchema, 'query'),
  asyncHandler(eventController.putEvent),
);

// 이벤트 삭제 (관리자만, eventId는 noticeId 또는 pollId)
router.delete(
  '/:eventId',
  authenticate,
  isNotUser,
  validate(eventIdParamSchema, 'params'),
  asyncHandler(eventController.deleteEvent),
);

export default router;
