import { Status } from '@prisma/client';
import { CustomError } from '@libs/error';
import { PollRepo, VoteForList } from './poll.repo';
import { CreatePollInput, ListPollsQuery } from './poll.validate';

// 투표 비즈니스 로직
export class PollService {
  constructor(private repo: PollRepo) {}

  // 투표 등록 (관리자만 가능)
  createPoll = async (input: CreatePollInput, user: { id: string; aptId: string | null; role: string }) => {
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
    const targetDong =
      input.buildingPermission === 0 ? [] : [String(input.buildingPermission)];

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

    return { message: '정상적으로 등록 처리되었습니다' };
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
      const dongStr = String(resident.dong);
      where.OR = [
        { targetDong: { isEmpty: true } },
        { targetDong: { has: dongStr } },
      ];
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
        where.targetDong = { has: String(query.buildingPermission) };
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

    const polls = items.map((v) => this.mapPollListItem(v));
    return { polls, totalCount };
  };

  private mapPollListItem = (v: VoteForList) => {
    const buildingPermission =
      v.targetDong.length === 0 ? 0 : parseInt(v.targetDong[0], 10) || 0;
    const status = v.status === 'DONE' ? 'CLOSED' : v.status;
    return {
      pollId: v.id,
      userId: v.authorId,
      title: v.title,
      writerName: v.author?.name ?? '',
      buildingPermission,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
      startDate: v.startDate,
      endDate: v.endDate,
      status,
    };
  };
}
