import { Request, Response } from 'express';
import type { CreatePollDto, UpdatePollDto } from './dto/response.dto';
import { PollRepo } from './poll.repo';
import { PollService } from './poll.service';
import {
  createPollSchema,
  listPollsSchema,
  pollIdParamSchema,
  updatePollSchema,
} from './poll.validate';

/** 투표 API 컨트롤러 - 등록, 목록, 상세, 수정, 삭제 */
export class PollController {
  constructor(private pollService: PollService) {}

  /** 투표 등록 - POST /api/polls */
  createPoll = async (req: Request, res: Response) => {
    const input = createPollSchema.parse(req.body) as CreatePollDto; // 본문 유효성 검사
    const result = await this.pollService.createPoll(input, req.user);
    return res.status(201).json(result);
  };

  /** 투표 목록 조회 - GET /api/polls (페이지, 상태, 동, 검색어 필터) */
  listPolls = async (req: Request, res: Response) => {
    const query = req.validatedQuery as ReturnType<typeof listPollsSchema.parse>; // 쿼리 검증
    const result = await this.pollService.listPolls(query, req.user);
    return res.status(200).json(result);
  };

  /** 투표 상세 조회 - GET /api/polls/:pollId */
  getPoll = async (req: Request, res: Response) => {
    const params = pollIdParamSchema.parse(req.params); // 경로 파라미터 검증
    const result = await this.pollService.getPoll(params.pollId, req.user);
    return res.status(200).json(result);
  };

  /** 투표 수정 - PATCH /api/polls/:pollId (관리자만, 시작 전에만) */
  updatePoll = async (req: Request, res: Response) => {
    const params = pollIdParamSchema.parse(req.params); // 경로 파라미터 검증
    const input = updatePollSchema.parse(req.body) as UpdatePollDto; // 본문 유효성 검사
    const result = await this.pollService.updatePoll(params.pollId, input, req.user);
    return res.status(200).json(result);
  };

  /** 투표 삭제 - DELETE /api/polls/:pollId (관리자만, 시작 전에만) */
  deletePoll = async (req: Request, res: Response) => {
    const params = pollIdParamSchema.parse(req.params); // 경로 파라미터 검증
    const result = await this.pollService.deletePoll(params.pollId, req.user);
    return res.status(200).json(result);
  };
}

const pollRepo = new PollRepo();
const pollService = new PollService(pollRepo);
export const pollController = new PollController(pollService);
