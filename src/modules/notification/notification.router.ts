import express from 'express';
import asyncHandler from '@middlewares/asyncHandler';
import { validate } from '@middlewares/validate';
import { authenticate } from '@middlewares/authenticate';
import { notificationController } from '@modules/notification/notification.controller';
import {
  notificationIdSchema,
  getNotificationsQuerySchema,
} from '@modules/notification/notification.validate';

const router = express.Router();

// 알림 목록 조회
router.get(
  '/',
  authenticate,
  validate(getNotificationsQuerySchema, 'query'),
  asyncHandler(notificationController.getNotifications),
);

// SSE 실시간 알림
router.get(
  '/sse',
  authenticate,
  asyncHandler(notificationController.sse),
);

// 전체 읽음 처리 (/:notificationId 보다 먼저 정의)
router.patch(
  '/read-all',
  authenticate,
  asyncHandler(notificationController.markAllAsRead),
);

// 개별 읽음 처리
router.patch(
  '/:notificationId/read',
  authenticate,
  validate(notificationIdSchema, 'params'),
  asyncHandler(notificationController.markAsRead),
);

export default router;
