import { Request, Response } from 'express';
import { ComplaintRepo } from './complaint.repo';
import { ComplaintService } from './complaint.service';
import { createComplaintSchema } from './complaint.validate';

export class ComplaintController {
  constructor(private complaintService: ComplaintService) {}

  createComplaint = async (req: Request, res: Response) => {
    const input = createComplaintSchema.parse(req.body);
    const result = await this.complaintService.createComplaint(input, req.user);
    return res.status(201).json(result);
  };
}

const complaintRepo = new ComplaintRepo();
const complaintService = new ComplaintService(complaintRepo);
export const complaintController = new ComplaintController(complaintService);
