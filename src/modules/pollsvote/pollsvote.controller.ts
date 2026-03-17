import { Request, Response } from 'express';
import type { OptionIdParamDto } from './dto/create.dto';
import { PollsvoteRepo } from './pollsvote.repo';
import { PollsvoteService } from './pollsvote.service';
import { optionIdParamSchema } from './pollsvote.validate';

/** 투표하기 API 컨트롤러 - 투표, 투표 취소 */
export class PollsvoteController {
  constructor(private pollsvoteService: PollsvoteService) {}

  /** 투표 - POST /api/options/:optionId/vote */
  voteOption = async (req: Request, res: Response) => {
    const params = optionIdParamSchema.parse(req.params) as OptionIdParamDto; // 경로 파라미터 검증
    const result = await this.pollsvoteService.voteOption(params.optionId, req.user);
    return res.status(200).json(result);
  };

  /** 투표 취소 - DELETE /api/options/:optionId/vote */
  cancelVote = async (req: Request, res: Response) => {
    const params = optionIdParamSchema.parse(req.params) as OptionIdParamDto; // 경로 파라미터 검증
    const result = await this.pollsvoteService.cancelVote(params.optionId, req.user);
    return res.status(200).json(result);
  };
}

const pollsvoteRepo = new PollsvoteRepo();
const pollsvoteService = new PollsvoteService(pollsvoteRepo);
export const pollsvoteController = new PollsvoteController(pollsvoteService);
