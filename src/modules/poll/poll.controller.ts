import { Request, Response } from 'express';
import { PollRepo } from './poll.repo';
import { PollService } from './poll.service';
import { createPollSchema } from './poll.validate';

// 투표 API 요청 핸들러
export class PollController {
  constructor(private pollService: PollService) {}

  // 투표 등록 요청 처리
  createPoll = async (req: Request, res: Response) => {
    const input = createPollSchema.parse(req.body);
    const result = await this.pollService.createPoll(input, req.user);
    return res.status(201).json(result);
  };
}

const pollRepo = new PollRepo();
const pollService = new PollService(pollRepo);
export const pollController = new PollController(pollService);
