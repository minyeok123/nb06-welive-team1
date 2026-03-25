import type { EventRow } from '../event.repo';

/** 이벤트 생성/수정 요청 DTO (쿼리 파라미터) */
export interface PutEventDto {
  boardType: 'NOTICE' | 'POLL';
  boardId: string;
  startDate: Date;
  endDate: Date;
}

/** 이벤트 목록 항목 응답 DTO */
export interface EventItemResponseDto {
  id: string;
  start: string;
  end: string;
  title: string;
  category: string;
  /** 공지/투표 구분(기존) */
  type: 'NOTICE' | 'POLL';
  /** 게시판 타입과 동일한 값 — 달력 UI가 VOTE만 표시하는 경우 사용 */
  boardType: 'NOTICE' | 'VOTE';
}

/** 이벤트 삭제 응답 DTO */
export interface EventDeleteResponseDto {
  id: string;
  startDate: string;
  endDate: string;
  boardType: 'NOTICE' | 'POLL';
  noticeId: string | null;
  pollId: string | null;
}

/**
 * 이벤트 목록 항목 → 응답 DTO 변환
 */
export const eventListResponseDto = (e: EventRow): EventItemResponseDto => ({
  id: e.id,
  start: e.start.toISOString(),
  end: e.end.toISOString(),
  title: e.title,
  category: e.category,
  type: e.type,
  boardType: e.type === 'POLL' ? 'VOTE' : 'NOTICE',
});

/**
 * 이벤트 삭제(NOTICE) → 응답 DTO 변환
 */
export const eventDeleteNoticeResponseDto = (
  eventId: string,
  startDate: Date,
  endDate: Date,
): EventDeleteResponseDto => ({
  id: eventId,
  startDate: new Date(startDate).toISOString(),
  endDate: new Date(endDate).toISOString(),
  boardType: 'NOTICE',
  noticeId: eventId,
  pollId: null,
});

/**
 * 이벤트 삭제(POLL) → 응답 DTO 변환
 */
export const eventDeletePollResponseDto = (
  eventId: string,
  startDate: Date,
  endDate: Date,
): EventDeleteResponseDto => ({
  id: eventId,
  startDate: startDate.toISOString(),
  endDate: endDate.toISOString(),
  boardType: 'POLL',
  noticeId: null,
  pollId: eventId,
});
