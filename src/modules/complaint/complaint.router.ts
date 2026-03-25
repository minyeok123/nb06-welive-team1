import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import {
  complaintIdParamSchema,
  createComplaintSchema,
  listComplaintsSchema,
  updateComplaintSchema,
  updateComplaintStatusSchema,
} from './complaint.validate';
import { complaintController } from './complaint.controller';

const router = express.Router();

// 민원 등록
router.post(
  '/',
  authenticate,
  validate(createComplaintSchema), // 요청 검증
  asyncHandler(complaintController.createComplaint),
);

// 민원 목록 조회
router.get(
  '/',
  authenticate,
  validate(listComplaintsSchema, 'query'),
  asyncHandler(complaintController.listComplaints),
);

// 민원 상세 조회
router.get(
  '/:complaintId',
  authenticate,
  validate(complaintIdParamSchema, 'params'),
  asyncHandler(complaintController.getComplaint),
);

// 민원 삭제
router.delete(
  '/:complaintId',
  authenticate,
  validate(complaintIdParamSchema, 'params'),
  asyncHandler(complaintController.deleteComplaint),
);

// 민원 수정
router.patch(
  '/:complaintId',
  authenticate,
  validate(complaintIdParamSchema, 'params'),
  validate(updateComplaintSchema),
  asyncHandler(complaintController.updateComplaint),
);

// 민원 상태 변경(관리자 이상)
router.patch(
  '/:complaintId/status',
  authenticate,
  validate(complaintIdParamSchema, 'params'),
  validate(updateComplaintStatusSchema),
  asyncHandler(complaintController.updateComplaintStatus),
);

export default router;
