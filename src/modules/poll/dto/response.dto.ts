import type { PollForList } from '../poll.repo';

/** 투표 등록 요청 DTO */
export interface CreatePollDto {
  boardId: string;
  status: 'PENDING' | 'IN_PROGRESS';
  title: string;
  content: string;
  buildingPermission: number;
  startDate: Date;
  endDate: Date;
  options: { title: string }[];
}

/** 투표 수정 요청 DTO */
export interface UpdatePollDto {
  title?: string;
  content?: string;
  buildingPermission?: number;
  startDate?: Date;
  endDate?: Date;
  status?: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  options?: { title: string }[];
}

/** 투표 상세 조회 소스 타입 (findPollById 반환값) */
export type PollDetailSource = {
  id: string;
  authorId: string;
  title: string;
  content: string;
  targetDong: number;
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
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
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
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
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
export const pollListResponseDto = (v: PollForList): PollListResponseDto => {
  const buildingPermission = v.targetDong;
  let status = 'IN_PROGRESS';
  const now = new Date();
  if (v.status === 'DONE' || v.endDate < now) {
    status = 'CLOSED';
  } else if (v.startDate > now) {
    status = 'PENDING';
  }
  return {
    pollId: v.id,
    userId: v.authorId,
    title: v.title,
    writerName: v.author?.name ?? '',
    buildingPermission,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
    startDate: v.startDate.toISOString(),
    endDate: v.endDate.toISOString(),
    status,
  };
};

/**
 * 투표 상세 → 응답 DTO 변환
 */
export const pollDetailResponseDto = (v: PollDetailSource): PollDetailResponseDto => {
  let status = 'IN_PROGRESS';
  const now = new Date();
  if (v.status === 'DONE' || v.endDate < now) {
    status = 'CLOSED';
  } else if (v.startDate > now) {
    status = 'PENDING';
  }
  const buildingPermission = v.targetDong;
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
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
    startDate: v.startDate.toISOString(),
    endDate: v.endDate.toISOString(),
    status,
    content: v.content,
    boardName,
    options,
  };
};

/**
 * 투표 등록 성공 응답 DTO
 */
export const pollCreateResponseDto = (): PollMessageResponseDto => ({
  message: '정상적으로 등록 처리되었습니다',
});

/**
 * 투표 수정 성공 응답 DTO
 */
export const pollUpdateResponseDto = (): PollMessageResponseDto => ({
  message: '정상적으로 수정 처리되었습니다',
});

/**
 * 투표 삭제 성공 응답 DTO
 */
export const pollDeleteResponseDto = (): PollMessageResponseDto => ({
  message: '정상적으로 삭제 처리되었습니다',
});
