import express from 'express';
import asyncHandler from '@/middlewares/asyncHandler';
import { validate } from '@/middlewares/validate';
import { authenticate } from '@/middlewares/authenticate';
import { optionIdParamSchema } from './pollsvote.validate';
import { pollsvoteController } from './pollsvote.controller';

const router = express.Router();

// 투표하기 (입주민만, POST /api/options/:optionId/vote)
router.post(
  '/:optionId/vote',
  authenticate,
  validate(optionIdParamSchema, 'params'),
  asyncHandler(pollsvoteController.voteOption),
);

// 투표 취소 (입주민만, DELETE /api/options/:optionId/vote)
router.delete(
  '/:optionId/vote',
  authenticate,
  validate(optionIdParamSchema, 'params'),
  asyncHandler(pollsvoteController.cancelVote),
);

export default router;
