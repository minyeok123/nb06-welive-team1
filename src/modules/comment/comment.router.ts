import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler';
import { validate } from '../../middlewares/validate';
import { authenticate } from '@/middlewares/authenticate';
import { CommentSchema, commentIdSchema } from './comment.validate';
import { commentController } from './comment.controller';
import { adminAuthorize, isNotSuperAdmin } from '@/middlewares/authorize';

const router = express.Router();

router.post(
  '/',
  authenticate,
  adminAuthorize,
  validate(CommentSchema, 'body'),
  asyncHandler(commentController.createComment),
);

router.patch(
  '/:commentId',
  authenticate,
  isNotSuperAdmin,
  validate(commentIdSchema, 'params'),
  validate(CommentSchema, 'body'),
  asyncHandler(commentController.updateComment),
);

router.delete(
  '/:commentId',
  authenticate,
  isNotSuperAdmin,
  validate(commentIdSchema, 'params'),
  asyncHandler(commentController.deleteComment),
);

export default router;
