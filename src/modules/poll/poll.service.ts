import { Status } from '@prisma/client';
import { CustomError } from '@libs/error';
import {
  type CreatePollDto,
  type UpdatePollDto,
  pollCreateResponseDto,
  pollDetailResponseDto,
  pollListResponseDto,
  pollDeleteResponseDto,
  pollUpdateResponseDto,
} from '@modules/poll/dto/response.dto';
import { PollRepo } from '@modules/poll/poll.repo';
import type { ListPollsQuery } from '@modules/poll/poll.validate';
import { withoutPasswordUser } from '@app-types/user.types';
import { Prisma } from '@prisma/client';
import { makeDong } from '@modules/poll/utils/apt.dong';
// 투표 비즈니스 로직
export class PollService {
  constructor(private repo: PollRepo) {}

  // 투표 등록 (관리자만 가능)
  createPoll = async (input: CreatePollDto, user: withoutPasswordUser) => {
    // 1. 게시판 권한 확인 (사용자의 아파트와 게시판의 아파트가 일치하는지)
    const board = await this.repo.findBoardById(input.boardId);
    if (!board || board.aptId !== user.aptId) {
      throw new CustomError(403, '소속된 아파트 게시판만 이용할 수 있습니다.');
    }
    if (board.boardType !== 'VOTE') {
      throw new CustomError(403, '투표 게시판에서만 투표를 생성할 수 있습니다.');
    }

    const dongRange = makeDong(board.apartment);

    if (
      input.buildingPermission !== 0 &&
      (input.buildingPermission < dongRange.min || input.buildingPermission > dongRange.max)
    ) {
      throw new CustomError(400, '유효하지 않은 동 번호입니다.');
    }

    if (input.startDate < new Date()) {
      throw new CustomError(400, '시작 시간은 현재 시간 이후여야 합니다.');
    }

    await this.repo.createPoll({
      boardId: input.boardId,
      authorId: user.id,
      aptId: user.aptId!,
      title: input.title,
      content: input.content,
      status: input.status,
      targetDong: input.buildingPermission,
      startDate: input.startDate,
      endDate: input.endDate,
      options: input.options,
    });

    return pollCreateResponseDto();
  };

  // 투표 목록 조회 (관리자·입주민)
  listPolls = async (query: ListPollsQuery, user: withoutPasswordUser) => {
    const where: Prisma.PollWhereInput = {
      deletedAt: null,
      board: { deletedAt: null, aptId: user.aptId! },
    };

    // 상태 필터 (CLOSED → DONE)
    if (query.status) {
      where.status = query.status === 'CLOSED' ? 'DONE' : query.status;
    }

    // 투표권자 필터 (buildingPermission)
    if (query.buildingPermission) {
      where.targetDong = query.buildingPermission;
    }

    // 검색어 (제목, 내용)
    if (query.keyword) {
      where.OR = [
        { title: { contains: query.keyword, mode: 'insensitive' } },
        { content: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const { items, totalCount } = await this.repo.findPolls({
      where,
      skip,
      take: query.limit,
    });

    const polls = items.map((p) => pollListResponseDto(p));
    return { polls, totalCount };
  };

  // 투표 상세 조회 (관리자·입주민)
  getPoll = async (pollId: string, user: withoutPasswordUser) => {
    const poll = await this.repo.findPollById(pollId);
    if (!poll) {
      throw new CustomError(404, '투표를 찾을 수 없습니다');
    }

    // 동일 아파트 확인
    if (poll.board.aptId !== user.aptId) {
      throw new CustomError(403, '소속 아파트 게시판이 아닙니다.');
    }

    return pollDetailResponseDto(poll);
  };

  // 투표 수정 (관리자만, 시작 전에만)
  updatePoll = async (pollId: string, input: UpdatePollDto, user: withoutPasswordUser) => {
    const vote = await this.repo.findPollById(pollId);
    if (!vote) {
      throw new CustomError(404, '투표를 찾을 수 없습니다');
    }

    if (vote.board?.aptId !== user.aptId) {
      throw new CustomError(403, '아파트에 소속된 관리자만 수정할 수 있습니다');
    }

    // 투표가 이미 시작된 경우 수정 불가
    if (new Date() >= vote.startDate) {
      throw new CustomError(403, '이미 시작된 투표는 수정할 수 없습니다');
    }

    const finalStartDate = input.startDate ?? vote.startDate;
    const finalEndDate = input.endDate ?? vote.endDate;
    if (finalStartDate >= finalEndDate) {
      throw new CustomError(400, '종료 시간은 시작 시간보다 이후여야 합니다');
    }
    if (finalStartDate < new Date() || finalEndDate < new Date()) {
      throw new CustomError(400, '투표 시작 및 종료 시간은 현재 시간보다 이후여야 합니다.');
    }
    const hasUpdates =
      input.title !== undefined ||
      input.content !== undefined ||
      input.buildingPermission !== undefined ||
      input.startDate !== undefined ||
      input.endDate !== undefined ||
      input.status !== undefined ||
      (input.options !== undefined && input.options.length > 0);
    if (!hasUpdates) {
      throw new CustomError(400, '수정할 내용이 없습니다');
    }

    const targetDong = input.buildingPermission;
    if (targetDong !== undefined && targetDong !== 0) {
      const dongRange = makeDong(vote.board.apartment);
      if (targetDong < dongRange.min || targetDong > dongRange.max) {
        throw new CustomError(400, '유효하지 않은 동 번호입니다.');
      }
    }

    await this.repo.updatePoll({
      pollId,
      title: input.title,
      content: input.content,
      status: input.status as Status | undefined,
      targetDong,
      startDate: input.startDate,
      endDate: input.endDate,
      options: input.options,
    });

    return pollUpdateResponseDto();
  };

  // 투표 삭제 (관리자만, 시작 전에만)
  deletePoll = async (pollId: string, user: withoutPasswordUser) => {
    const vote = await this.repo.findPollById(pollId);
    if (!vote) {
      throw new CustomError(404, '투표를 찾을 수 없습니다');
    }

    if (vote.board?.aptId !== user.aptId) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    // 투표가 이미 시작된 경우 삭제 불가
    if (new Date() >= vote.startDate) {
      throw new CustomError(403, '이미 시작된 투표는 삭제할 수 없습니다');
    }

    await this.repo.softDeletePoll(pollId);

    return pollDeleteResponseDto();
  };
}
