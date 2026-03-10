import { Request, Response } from 'express';
import { ComplaintRepo } from './complaint.repo';
import { ComplaintService } from './complaint.service';
import { complaintIdParamSchema, createComplaintSchema, listComplaintsSchema, updateComplaintSchema } from './complaint.validate';

export class ComplaintController {
  constructor(private complaintService: ComplaintService) {}

  createComplaint = async (req: Request, res: Response) => {
    // 민원 등록 요청 처리
    const input = createComplaintSchema.parse(req.body); // 본문 유효성 검사
    const result = await this.complaintService.createComplaint(input, req.user);
    return res.status(201).json(result);
  };

  listComplaints = async (req: Request, res: Response) => {
    // 민원 목록 조회 요청 처리
    const query = req.validatedQuery as ReturnType<typeof listComplaintsSchema.parse>;
    // 쿼리 검증 후 서비스로 전달
    const result = await this.complaintService.listComplaints(query, req.user);
    return res.status(200).json(result);
  };

  getComplaint = async (req: Request, res: Response) => {
    // 민원 상세 조회 요청 처리
    const params = complaintIdParamSchema.parse(req.params); // 경로 파라미터 검증
    const result = await this.complaintService.getComplaint(params.complaintId, req.user);
    return res.status(200).json(result);
  };

  updateComplaint = async (req: Request, res: Response) => {
    // 민원 수정 요청 처리
    const params = complaintIdParamSchema.parse(req.params); // 경로 파라미터 검증
    const input = updateComplaintSchema.parse(req.body); // 본문 유효성 검사
    const result = await this.complaintService.updateComplaint(params.complaintId, input, req.user);
    return res.status(200).json(result);
  };
}

const complaintRepo = new ComplaintRepo();
const complaintService = new ComplaintService(complaintRepo);
export const complaintController = new ComplaintController(complaintService);
