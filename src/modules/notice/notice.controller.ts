import { Request, Response } from 'express';
import { NoticeRepo } from './notice.repo';
import { NoticeService } from './notice.service';
import {
  createNoticeSchema,
  updateNoticeSchema,
  noticeIdSchema,
  getNoticesQuerySchema,
} from './notice.validate';

export class NoticeController {
  constructor(private noticeService: NoticeService) {}

  createNotice = async (req: Request, res: Response) => {
    const input = createNoticeSchema.parse(req.body);
    const result = await this.noticeService.createNotice(input, req.user);
    return res.status(201).json(result);
  };

  getNotices = async (req: Request, res: Response) => {
    const query = getNoticesQuerySchema.parse(req.query);
    const result = await this.noticeService.getNotices(query, req.user?.aptId ?? null);
    return res.status(200).json(result);
  };

  getNoticeById = async (req: Request, res: Response) => {
    const { noticeId } = noticeIdSchema.parse(req.params);
    const result = await this.noticeService.getNoticeById(noticeId, req.user?.aptId ?? null);
    return res.status(200).json(result);
  };

  incrementNoticeView = async (req: Request, res: Response) => {
    const { noticeId } = noticeIdSchema.parse(req.params);
    const result = await this.noticeService.incrementNoticeView(noticeId, req.user?.aptId ?? null);
    return res.status(200).json(result);
  };

  updateNotice = async (req: Request, res: Response) => {
    const { noticeId } = noticeIdSchema.parse(req.params);
    const input = updateNoticeSchema.parse(req.body);
    const result = await this.noticeService.updateNotice(noticeId, input, req.user);
    return res.status(200).json(result);
  };

  deleteNotice = async (req: Request, res: Response) => {
    const { noticeId } = noticeIdSchema.parse(req.params);
    const result = await this.noticeService.deleteNotice(noticeId, req.user);
    return res.status(200).json(result);
  };
}

const noticeRepo = new NoticeRepo();
const noticeService = new NoticeService(noticeRepo);
export const noticeController = new NoticeController(noticeService);
