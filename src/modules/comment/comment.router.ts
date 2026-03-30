import express from 'express';
import asyncHandler from '@middlewares/asyncHandler';
import { validate } from '@middlewares/validate';
import { authenticate } from '@middlewares/authenticate';
import { CommentSchema, commentIdSchema } from '@modules/comment/comment.validate';
import { commentController } from '@modules/comment/comment.controller';
import { isNotSuperAdmin } from '@middlewares/authorize';

const router = express.Router();

// 댓글 작성: 입주민·관리자 모두 가능(소속 아파트 글만 서비스에서 검증). adminAuthorize 제거 시 USER 403 해소
router.post(
  '/',
  authenticate,
  isNotSuperAdmin,
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
