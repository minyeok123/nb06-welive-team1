import { Status } from '@prisma/client';
import { CustomError } from '@libs/error';
import type { CreatePollDto, UpdatePollDto } from './dto/create.dto';
import {
  pollCreateResponseDto,
  pollDetailResponseDto,
  pollListResponseDto,
  pollDeleteResponseDto,
  pollUpdateResponseDto,
} from './dto/response.dto';
import { PollRepo } from './poll.repo';
import type { ListPollsQuery } from './poll.validate';

// 투표 비즈니스 로직
export class PollService {
  constructor(private repo: PollRepo) {}

  // 투표 등록 (관리자만 가능)
  createPoll = async (
    input: CreatePollDto,
    user: { id: string; aptId: string | null; role: string },
  ) => {
    if (!user?.id) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    // 관리자(ADMIN, SUPER_ADMIN)만 투표 등록 가능
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin) {
      throw new CustomError(403, '관리자만 투표를 등록할 수 있습니다');
    }

    // 아파트 소속 관리자만 등록 가능
    if (!user.aptId) {
      throw new CustomError(403, '아파트에 소속된 관리자만 투표를 등록할 수 있습니다');
    }

    // 투표권자 범위: buildingPermission 0 = 전체, 그 외 = 특정 동
    const targetDong = input.buildingPermission === 0 ? [] : [input.buildingPermission];

    const status = (input.status ?? 'IN_PROGRESS') as Status;

    await this.repo.createPoll({
      boardId: input.boardId,
      authorId: user.id,
      aptId: user.aptId,
      title: input.title,
      content: input.content,
      status,
      targetDong,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      options: input.options,
    });

    return pollCreateResponseDto();
  };

  // 투표 목록 조회 (관리자·입주민)
  listPolls = async (
    query: ListPollsQuery,
    user: { id: string; aptId: string | null; role: string },
  ) => {
    if (!user?.id) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin && !user.aptId) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    const where: any = {
      deletedAt: null,
      board: user.aptId ? { deletedAt: null, aptId: user.aptId } : { deletedAt: null },
    };

    // 입주민: 자신이 투표권자인 투표만 조회
    if (!isAdmin && user.aptId) {
      const resident = await this.repo.findResidentByUserId(user.id);
      if (!resident) {
        return { polls: [], totalCount: 0 };
      }
      const dong = resident.dong;
      where.OR = [{ targetDong: { isEmpty: true } }, { targetDong: { has: dong } }];
    }

    // 상태 필터 (CLOSED → DONE)
    const statusFilter = query.status === 'CLOSED' ? 'DONE' : query.status;
    if (statusFilter) {
      where.status = statusFilter;
    }

    // 투표권자 필터 (buildingPermission)
    if (query.buildingPermission !== undefined) {
      if (query.buildingPermission === 0) {
        where.targetDong = { isEmpty: true };
      } else {
        where.targetDong = { has: query.buildingPermission };
      }
    }

    // 검색어 (제목, 내용)
    if (query.keyword) {
      const keywordFilter = {
        OR: [
          { title: { contains: query.keyword, mode: 'insensitive' } },
          { content: { contains: query.keyword, mode: 'insensitive' } },
        ],
      };
      where.AND = [...(where.AND ?? []), keywordFilter];
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 11;
    const skip = (page - 1) * limit;

    const { items, totalCount } = await this.repo.findPolls({
      where,
      skip,
      take: limit,
    });

    const polls = items.map((p) => pollListResponseDto(p));
    return { polls, totalCount };
  };

  // 투표 상세 조회 (관리자·입주민)
  getPoll = async (pollId: string, user: { id: string; aptId: string | null; role: string }) => {
    if (!user?.id) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin && !user.aptId) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    const poll = await this.repo.findPollById(pollId);
    if (!poll) {
      throw new CustomError(404, '투표를 찾을 수 없습니다');
    }

    // 동일 아파트 확인
    if (user.aptId && poll.board?.aptId !== user.aptId) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    // 입주민: 자신이 투표권자인 투표만 조회 가능
    if (!isAdmin && user.aptId) {
      const resident = await this.repo.findResidentByUserId(user.id);
      if (!resident) {
        throw new CustomError(403, '접근 권한이 없습니다');
      }
      const dong = resident.dong;
      const isEligible = poll.targetDong.length === 0 || poll.targetDong.includes(dong);
      if (!isEligible) {
        throw new CustomError(403, '접근 권한이 없습니다');
      }
    }

    return pollDetailResponseDto(poll);
  };

  // 투표 수정 (관리자만, 시작 전에만)
  updatePoll = async (
    pollId: string,
    input: UpdatePollDto,
    user: { id: string; aptId: string | null; role: string },
  ) => {
    if (!user?.id) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin) {
      throw new CustomError(403, '관리자만 투표를 수정할 수 있습니다');
    }

    if (!user.aptId) {
      throw new CustomError(403, '아파트에 소속된 관리자만 수정할 수 있습니다');
    }

    const vote = await this.repo.findPollById(pollId);
    if (!vote) {
      throw new CustomError(404, '투표를 찾을 수 없습니다');
    }

    if (vote.board?.aptId !== user.aptId) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    // 투표가 이미 시작된 경우 수정 불가
    if (new Date() >= vote.startDate) {
      throw new CustomError(403, '이미 시작된 투표는 수정할 수 없습니다');
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

    const targetDong =
      input.buildingPermission !== undefined
        ? input.buildingPermission === 0
          ? []
          : [input.buildingPermission]
        : undefined;

    await this.repo.updatePoll({
      pollId,
      title: input.title,
      content: input.content,
      status: input.status as Status | undefined,
      targetDong,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      options: input.options,
    });

    return pollUpdateResponseDto();
  };

  // 투표 삭제 (관리자만, 시작 전에만)
  deletePoll = async (pollId: string, user: { id: string; aptId: string | null; role: string }) => {
    if (!user?.id) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin) {
      throw new CustomError(403, '관리자만 투표를 삭제할 수 있습니다');
    }

    if (!user.aptId) {
      throw new CustomError(403, '아파트에 소속된 관리자만 삭제할 수 있습니다');
    }

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
