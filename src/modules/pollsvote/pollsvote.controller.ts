import { Request, Response } from 'express';
import { PollsvoteRepo } from './pollsvote.repo';
import { PollsvoteService } from './pollsvote.service';
import { optionIdParamSchema } from './pollsvote.validate';

// 투표하기 API 요청 핸들러
export class PollsvoteController {
  constructor(private pollsvoteService: PollsvoteService) {}

  voteOption = async (req: Request, res: Response) => {
    const params = optionIdParamSchema.parse(req.params);
    const result = await this.pollsvoteService.voteOption(params.optionId, req.user);
    return res.status(200).json(result);
  };

  cancelVote = async (req: Request, res: Response) => {
    const params = optionIdParamSchema.parse(req.params);
    const result = await this.pollsvoteService.cancelVote(params.optionId, req.user);
    return res.status(200).json(result);
  };
}

const pollsvoteRepo = new PollsvoteRepo();
const pollsvoteService = new PollsvoteService(pollsvoteRepo);
export const pollsvoteController = new PollsvoteController(pollsvoteService);
