import { Request, Response } from 'express';
import { ComplaintRepo } from './complaint.repo';
import { ComplaintService } from './complaint.service';
import { createComplaintSchema, listComplaintsSchema } from './complaint.validate';

export class ComplaintController {
  constructor(private complaintService: ComplaintService) {}

  createComplaint = async (req: Request, res: Response) => {
    const input = createComplaintSchema.parse(req.body); // 본문 유효성 검사
    const result = await this.complaintService.createComplaint(input, req.user);
    return res.status(201).json(result);
  };

  listComplaints = async (req: Request, res: Response) => {
    const query = (req.validatedQuery ?? req.query) as ReturnType<
      typeof listComplaintsSchema.parse
    >;
    // 쿼리 검증 후 서비스로 전달
    const result = await this.complaintService.listComplaints(query, req.user);
    return res.status(200).json(result);
  };
}

const complaintRepo = new ComplaintRepo();
const complaintService = new ComplaintService(complaintRepo);
export const complaintController = new ComplaintController(complaintService);
