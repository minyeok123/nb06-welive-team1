import { Request, Response } from 'express';
import { ComplaintRepo } from './complaint.repo';
import { ComplaintService } from './complaint.service';
import type {
  CreateComplaintDto,
  UpdateComplaintDto,
  UpdateComplaintStatusDto,
} from './dto/response.dto';
import {
  complaintIdParamSchema,
  createComplaintSchema,
  listComplaintsSchema,
  updateComplaintSchema,
  updateComplaintStatusSchema,
} from './complaint.validate';

/** 민원 API 컨트롤러 - 등록, 목록, 상세, 수정, 삭제, 상태 변경 */
export class ComplaintController {
  constructor(private complaintService: ComplaintService) {}

  /** 민원 등록 - POST /api/complaints */
  createComplaint = async (req: Request, res: Response) => {
    const input = createComplaintSchema.parse(req.body) as CreateComplaintDto; // 본문 유효성 검사
    const result = await this.complaintService.createComplaint({ input, user: req.user });
    return res.status(201).json(result);
  };

  /** 민원 목록 조회 - GET /api/complaints (페이지, 상태, 공개여부, 동/호, 검색어 필터) */
  listComplaints = async (req: Request, res: Response) => {
    const query = req.validatedQuery as ReturnType<typeof listComplaintsSchema.parse>; // 쿼리 검증
    const result = await this.complaintService.listComplaints({ query, user: req.user });
    return res.status(200).json(result);
  };

  /** 민원 상세 조회 - GET /api/complaints/:complaintId */
  getComplaint = async (req: Request, res: Response) => {
    const params = complaintIdParamSchema.parse(req.params); // 경로 파라미터 검증
    const result = await this.complaintService.getComplaint({
      complaintId: params.complaintId,
      user: req.user,
    });
    return res.status(200).json(result);
  };

  /** 민원 수정 - PATCH /api/complaints/:complaintId (작성자만, 접수 전에만) */
  updateComplaint = async (req: Request, res: Response) => {
    const params = complaintIdParamSchema.parse(req.params); // 경로 파라미터 검증
    const input = updateComplaintSchema.parse(req.body) as UpdateComplaintDto; // 본문 유효성 검사
    const result = await this.complaintService.updateComplaint({
      complaintId: params.complaintId,
      input,
      user: req.user,
    });
    return res.status(200).json(result);
  };

  /** 민원 삭제 - DELETE /api/complaints/:complaintId (작성자만, 접수 전에만) */
  deleteComplaint = async (req: Request, res: Response) => {
    const params = complaintIdParamSchema.parse(req.params); // 경로 파라미터 검증
    const result = await this.complaintService.deleteComplaint({
      complaintId: params.complaintId,
      user: req.user,
    });
    return res.status(200).json(result);
  };

  /** 민원 상태 변경 - PATCH /api/complaints/:complaintId/status (관리자 전용) */
  updateComplaintStatus = async (req: Request, res: Response) => {
    const params = complaintIdParamSchema.parse(req.params); // 경로 파라미터 검증
    const input = updateComplaintStatusSchema.parse(req.body) as UpdateComplaintStatusDto; // 본문 유효성 검사
    const result = await this.complaintService.updateComplaintStatus({
      complaintId: params.complaintId,
      input,
      user: req.user,
    });
    return res.status(200).json(result);
  };
}

const complaintRepo = new ComplaintRepo();
const complaintService = new ComplaintService(complaintRepo);
export const complaintController = new ComplaintController(complaintService);
