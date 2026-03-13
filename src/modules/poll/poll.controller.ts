import { Request, Response } from 'express';
import { PollRepo } from './poll.repo';
import { PollService } from './poll.service';
import { createPollSchema, listPollsSchema, pollIdParamSchema } from './poll.validate';

// 투표 API 요청 핸들러
export class PollController {
  constructor(private pollService: PollService) {}

  // 투표 상세 조회 요청 처리
  getPoll = async (req: Request, res: Response) => {
    const params = pollIdParamSchema.parse(req.params);
    const result = await this.pollService.getPoll(params.pollId, req.user);
    return res.status(200).json(result);
  };

  // 투표 목록 조회 요청 처리
  listPolls = async (req: Request, res: Response) => {
    const query = req.validatedQuery as ReturnType<typeof listPollsSchema.parse>;
    const result = await this.pollService.listPolls(query, req.user);
    return res.status(200).json(result);
  };

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
