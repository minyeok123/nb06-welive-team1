import { EventRepo } from './event.repo';
import { ListEventsQuery } from './event.validate';

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
}
