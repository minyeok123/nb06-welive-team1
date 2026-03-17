import type { PollForList } from '../poll.repo';

/** 투표 상세 조회 소스 타입 (findPollById 반환값) */
export type PollDetailSource = {
  id: string;
  authorId: string;
  title: string;
  content: string;
  targetDong: number[];
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  author?: { id: string; name: string } | null;
  board?: { aptId: string; boardType: string } | null;
  options?: Array<{
    id: string;
    option: string;
    _count?: { participations: number };
  }>;
};

/** 투표 목록 항목 응답 DTO */
export interface PollListResponseDto {
  pollId: string;
  userId: string;
  title: string;
  writerName: string;
  buildingPermission: number;
  createdAt: Date;
  updatedAt: Date;
  startDate: Date;
  endDate: Date;
  status: string;
}

/** 투표 선택지 응답 DTO */
export interface PollOptionResponseDto {
  id: string;
  title: string;
  voteCount: number;
}

/** 투표 상세 응답 DTO */
export interface PollDetailResponseDto {
  pollId: string;
  userId: string;
  title: string;
  writerName: string;
  buildingPermission: number;
  createdAt: Date;
  updatedAt: Date;
  startDate: Date;
  endDate: Date;
  status: string;
  content: string;
  boardName: string;
  options: PollOptionResponseDto[];
}

/** 투표 등록/수정/삭제 응답 DTO */
export interface PollMessageResponseDto {
  message: string;
}

/** 투표 목록 결과 DTO */
export interface PollListResultDto {
  polls: PollListResponseDto[];
  totalCount: number;
}

/**
 * 투표 목록 항목 → 응답 DTO 변환
 */
export const toPollListResponseDto = (v: PollForList): PollListResponseDto => {
  const buildingPermission = v.targetDong.length === 0 ? 0 : v.targetDong[0] ?? 0;
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

/**
 * 투표 상세 → 응답 DTO 변환
 */
export const toPollDetailResponseDto = (v: PollDetailSource): PollDetailResponseDto => {
  const buildingPermission = v.targetDong.length === 0 ? 0 : v.targetDong[0] ?? 0;
  const status = v.status === 'DONE' ? 'CLOSED' : v.status;
  const boardName = v.board?.boardType === 'VOTE' ? '주민투표' : '투표';
  const options = (v.options ?? []).map((opt) => ({
    id: opt.id,
    title: opt.option,
    voteCount: opt._count?.participations ?? 0,
  }));
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
    content: v.content,
    boardName,
    options,
  };
};

/**
 * 투표 등록 성공 응답 DTO
 */
export const toPollCreateResponseDto = (): PollMessageResponseDto => ({
  message: '정상적으로 등록 처리되었습니다',
});

/**
 * 투표 수정 성공 응답 DTO
 */
export const toPollUpdateResponseDto = (): PollMessageResponseDto => ({
  message: '정상적으로 수정 처리되었습니다',
});

/**
 * 투표 삭제 성공 응답 DTO
 */
export const toPollDeleteResponseDto = (): PollMessageResponseDto => ({
  message: '정상적으로 삭제 처리되었습니다',
});
