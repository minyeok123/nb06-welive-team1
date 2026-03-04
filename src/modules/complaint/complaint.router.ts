import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import { createComplaintSchema } from './complaint.validate';
import { complaintController } from './complaint.controller';

const router = express.Router();

router.post(
  '/',
  authenticate,
  validate(createComplaintSchema),
  asyncHandler(complaintController.createComplaint),
);

export default router;
