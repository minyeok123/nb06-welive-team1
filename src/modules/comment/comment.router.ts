import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler';
import { validate } from '../../middlewares/validate';
import { authenticate } from '@/middlewares/authenticate';
<<<<<<< HEAD
import { CommentSchema, commentIdSchema } from './comment.validate';
=======
import {
  createCommentSchema,
  updateCommentSchema,
  commentIdSchema,
} from './comment.validate';
>>>>>>> d23110f (feat: Notice, Comment 모듈 구현 (스키마 변경 반영))
import { commentController } from './comment.controller';

const router = express.Router();

router.post(
  '/',
  authenticate,
<<<<<<< HEAD
  validate(CommentSchema, 'body'),
=======
  validate(createCommentSchema, 'body'),
>>>>>>> d23110f (feat: Notice, Comment 모듈 구현 (스키마 변경 반영))
  asyncHandler(commentController.createComment),
);

router.patch(
  '/:commentId',
  authenticate,
  validate(commentIdSchema, 'params'),
<<<<<<< HEAD
  validate(CommentSchema, 'body'),
=======
  validate(updateCommentSchema, 'body'),
>>>>>>> d23110f (feat: Notice, Comment 모듈 구현 (스키마 변경 반영))
  asyncHandler(commentController.updateComment),
);

router.delete(
  '/:commentId',
  authenticate,
  validate(commentIdSchema, 'params'),
  asyncHandler(commentController.deleteComment),
);

export default router;
