import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import { isNotUser } from '../../middlewares/authorize';
import { createPollSchema } from './poll.validate';
import { pollController } from './poll.controller';

const router = express.Router();

// 투표 등록 (관리자만)
router.post(
  '/',
  authenticate, // 로그인 필요
  isNotUser, // 관리자(ADMIN, SUPER_ADMIN)만 허용
  validate(createPollSchema), // 요청 본문 검증
  asyncHandler(pollController.createPoll),
);

export default router;
