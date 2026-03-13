import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler';
import { validate } from '../../middlewares/validate';
import { authenticate } from '@/middlewares/authenticate';
import {
  createCommentSchema,
  updateCommentSchema,
  commentIdSchema,
} from './comment.validate';
import { commentController } from './comment.controller';

const router = express.Router();

router.post(
  '/',
  authenticate,
  validate(createCommentSchema, 'body'),
  asyncHandler(commentController.createComment),
);

router.patch(
  '/:commentId',
  authenticate,
  validate(commentIdSchema, 'params'),
  validate(updateCommentSchema, 'body'),
  asyncHandler(commentController.updateComment),
);

router.delete(
  '/:commentId',
  authenticate,
  validate(commentIdSchema, 'params'),
  asyncHandler(commentController.deleteComment),
);

export default router;
