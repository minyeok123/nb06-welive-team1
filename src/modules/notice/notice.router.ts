import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler';
import { validate } from '../../middlewares/validate';
import { authenticate } from '@/middlewares/authenticate';
import {
  createNoticeSchema,
  updateNoticeSchema,
  noticeIdSchema,
  getNoticesQuerySchema,
} from './notice.validate';
import { noticeController } from './notice.controller';

const router = express.Router();

router.post(
  '/',
  authenticate,
  validate(createNoticeSchema, 'body'),
  asyncHandler(noticeController.createNotice),
);

router.get(
  '/',
  authenticate,
  validate(getNoticesQuerySchema, 'query'),
  asyncHandler(noticeController.getNotices),
);

router.get(
  '/:noticeId',
  authenticate,
  validate(noticeIdSchema, 'params'),
  asyncHandler(noticeController.getNoticeById),
);

router.patch(
  '/:noticeId',
  authenticate,
  validate(noticeIdSchema, 'params'),
  validate(updateNoticeSchema, 'body'),
  asyncHandler(noticeController.updateNotice),
);

router.delete(
  '/:noticeId',
  authenticate,
  validate(noticeIdSchema, 'params'),
  asyncHandler(noticeController.deleteNotice),
);

export default router;
