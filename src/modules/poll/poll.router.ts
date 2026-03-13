import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import { isNotUser } from '../../middlewares/authorize';
import {
  createPollSchema,
  listPollsSchema,
  pollIdParamSchema,
  updatePollSchema,
} from './poll.validate';
import { pollController } from './poll.controller';

const router = express.Router();

// 투표 목록 조회 (관리자·입주민)
router.get(
  '/',
  authenticate,
  validate(listPollsSchema, 'query'),
  asyncHandler(pollController.listPolls),
);

// 투표 상세 조회 (관리자·입주민)
router.get(
  '/:pollId',
  authenticate,
  validate(pollIdParamSchema, 'params'),
  asyncHandler(pollController.getPoll),
);

// 투표 수정 (관리자만, 시작 전에만)
router.patch(
  '/:pollId',
  authenticate,
  isNotUser,
  validate(pollIdParamSchema, 'params'),
  validate(updatePollSchema),
  asyncHandler(pollController.updatePoll),
);

// 투표 삭제 (관리자만, 시작 전에만)
router.delete(
  '/:pollId',
  authenticate,
  isNotUser,
  validate(pollIdParamSchema, 'params'),
  asyncHandler(pollController.deletePoll),
);

// 투표 등록 (관리자만)
router.post(
  '/',
  authenticate, // 로그인 필요
  isNotUser, // 관리자(ADMIN, SUPER_ADMIN)만 허용
  validate(createPollSchema), // 요청 본문 검증
  asyncHandler(pollController.createPoll),
);

export default router;
