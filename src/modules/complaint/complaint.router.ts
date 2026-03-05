import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import { createComplaintSchema, listComplaintsSchema } from './complaint.validate';
import { complaintController } from './complaint.controller';

const router = express.Router();

router.post(
  '/',
  authenticate,
  validate(createComplaintSchema), // 요청 검증
  asyncHandler(complaintController.createComplaint),
);

router.get(
  '/',
  authenticate,
  validate(listComplaintsSchema, 'query'),
  asyncHandler(complaintController.listComplaints),
);

export default router;
