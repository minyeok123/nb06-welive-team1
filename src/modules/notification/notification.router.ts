import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler';
import { authenticate } from '@/middlewares/authenticate';
import { notificationController } from './notification.controller';

const router = express.Router();

router.get(
  '/sse',
  authenticate,
  asyncHandler(notificationController.sse),
);

router.patch(
  '/:notificationid/read',
  authenticate,
  asyncHandler(notificationController.markAsRead),
);

export default router;
