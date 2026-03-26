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
import { userAuthorize, isNotSuperAdmin, adminAuthorize } from '../../middlewares/authorize';

const router = express.Router();

// 민원 등록
router.post(
  '/',
  authenticate,
  userAuthorize,
  validate(createComplaintSchema), // 요청 검증
  asyncHandler(complaintController.createComplaint),
);

// 민원 목록 조회
router.get(
  '/',
  authenticate,
  isNotSuperAdmin,
  validate(listComplaintsSchema, 'query'),
  asyncHandler(complaintController.listComplaints),
);

// 민원 조회수 증가 (상세 GET보다 먼저 등록)
router.post(
  '/:complaintId/view',
  authenticate,
  isNotSuperAdmin,
  validate(complaintIdParamSchema, 'params'),
  asyncHandler(complaintController.incrementComplaintView),
);

// 민원 상세 조회
router.get(
  '/:complaintId',
  authenticate,
  isNotSuperAdmin,
  validate(complaintIdParamSchema, 'params'),
  asyncHandler(complaintController.getComplaint),
);

// 민원 삭제
router.delete(
  '/:complaintId',
  authenticate,
  userAuthorize,
  validate(complaintIdParamSchema, 'params'),
  asyncHandler(complaintController.deleteComplaint),
);

// 민원 수정
router.patch(
  '/:complaintId',
  authenticate,
  userAuthorize,
  validate(complaintIdParamSchema, 'params'),
  validate(updateComplaintSchema),
  asyncHandler(complaintController.updateComplaint),
);

// 민원 상태 변경(관리자 이상)
router.patch(
  '/:complaintId/status',
  authenticate,
  adminAuthorize,
  validate(complaintIdParamSchema, 'params'),
  validate(updateComplaintStatusSchema),
  asyncHandler(complaintController.updateComplaintStatus),
);

export default router;
