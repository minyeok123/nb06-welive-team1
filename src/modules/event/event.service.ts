import { CustomError } from '@libs/error';
import { EventRepo } from './event.repo';
import { ListEventsQuery, PutEventQuery } from './event.validate';

// 이벤트 비즈니스 로직
export class EventService {
  constructor(private repo: EventRepo) {}

  // 연도·월 기준으로 아파트 이벤트(NOTICE, POLL) 목록 조회
  listEvents = async (query: ListEventsQuery) => {
    const monthStart = new Date(query.year, query.month - 1, 1); // 해당 월 1일 00:00
    const monthEnd = new Date(query.year, query.month, 0, 23, 59, 59, 999); // 해당 월 마지막 날 23:59:59

    const events = await this.repo.findEventsByApartmentAndMonth(
      query.apartmentId,
      monthStart,
      monthEnd,
    );

    // ISO 문자열로 변환하여 응답
    return events.map((e) => ({
      id: e.id,
      start: e.start.toISOString(),
      end: e.end.toISOString(),
      title: e.title,
      category: e.category,
      type: e.type,
    }));
  };

  // 게시글(NOTICE 또는 POLL) 일정 생성/수정 (관리자만)
  putEvent = async (
    query: PutEventQuery,
    user: { id: string; aptId: string | null; role: string },
  ) => {
    if (!user?.id) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin) {
      throw new CustomError(403, '관리자만 이벤트 일정을 수정할 수 있습니다');
    }

    if (!user.aptId) {
      throw new CustomError(403, '아파트에 소속된 관리자만 수정할 수 있습니다');
    }

    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    if (query.boardType === 'NOTICE') {
      const notice = await this.repo.findNoticeById(query.boardId);
      if (!notice) {
        throw new CustomError(404, '공지를 찾을 수 없습니다');
      }
      if (notice.board?.aptId !== user.aptId) {
        throw new CustomError(403, '접근 권한이 없습니다');
      }
      await this.repo.updateNoticeEvent(query.boardId, startDate, endDate);
    } else {
      const vote = await this.repo.findPollById(query.boardId);
      if (!vote) {
        throw new CustomError(404, '투표를 찾을 수 없습니다');
      }
      if (vote.board?.aptId !== user.aptId) {
        throw new CustomError(403, '접근 권한이 없습니다');
      }
      await this.repo.updatePollEvent(query.boardId, startDate, endDate);
    }
  };
}
