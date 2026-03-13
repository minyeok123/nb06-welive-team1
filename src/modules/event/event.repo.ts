import { prisma } from '@libs/prisma';

// 이벤트 행 타입 (공지·투표 통합)
export type EventRow = {
  id: string;
  start: Date;
  end: Date;
  title: string;
  category: string;
  type: 'NOTICE' | 'POLL';
};

// 이벤트 DB 접근 레이어
export class EventRepo {
  // 아파트·연월 기준으로 공지(NOTICE)와 투표(POLL) 이벤트 조회
  findEventsByApartmentAndMonth = async (
    apartmentId: string,
    monthStart: Date,
    monthEnd: Date,
  ): Promise<EventRow[]> => {
    const [notices, votes] = await Promise.all([
      this.findNoticeEvents(apartmentId, monthStart, monthEnd),
      this.findPollEvents(apartmentId, monthStart, monthEnd),
    ]);

    const events = [...notices, ...votes];
    events.sort((a, b) => a.start.getTime() - b.start.getTime()); // 시작일 기준 정렬
    return events;
  };

  // 공지(NOTICE) 이벤트 조회 (startDate/endDate가 해당 월과 겹치는 경우)
  private findNoticeEvents = async (
    apartmentId: string,
    monthStart: Date,
    monthEnd: Date,
  ): Promise<EventRow[]> => {
    const notices = await prisma.notice.findMany({
      where: {
        deletedAt: null,
        board: {
          aptId: apartmentId,
          deletedAt: null,
        },
        OR: [
          // startDate, endDate 둘 다 있는 경우: 해당 월과 기간이 겹치는 공지
          {
            AND: [
              { startDate: { not: null } },
              { endDate: { not: null } },
              { startDate: { lte: monthEnd } },
              { endDate: { gte: monthStart } },
            ],
          },
          // startDate만 있는 경우: 해당 월에 시작일이 포함된 공지
          {
            AND: [
              { startDate: { not: null } },
              { endDate: null },
              { startDate: { gte: monthStart, lte: monthEnd } },
            ],
          },
          // endDate만 있는 경우: 해당 월에 종료일이 포함된 공지
          {
            AND: [
              { startDate: null },
              { endDate: { not: null } },
              { endDate: { gte: monthStart, lte: monthEnd } },
            ],
          },
          // 날짜 미설정: 해당 월에 생성된 공지
          {
            AND: [
              { startDate: null },
              { endDate: null },
              { createdAt: { gte: monthStart, lte: monthEnd } },
            ],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        category: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      },
    });

    return notices.map((n) => {
      const start = n.startDate ?? n.createdAt;
      const end = n.endDate ?? start;
      const startDate = new Date(start);
      const endDate = new Date(end);
      // 종료일이 00:00이면 당일 23:59:59로 처리 (종일 이벤트)
      if (endDate.getHours() === 0 && endDate.getMinutes() === 0) {
        endDate.setHours(23, 59, 59, 999);
      }
      return {
        id: n.id,
        start: startDate,
        end: endDate,
        title: n.title,
        category: n.category,
        type: 'NOTICE' as const,
      };
    });
  };

  // 투표(POLL) 이벤트 조회 (startDate~endDate가 해당 월과 겹치는 경우)
  private findPollEvents = async (
    apartmentId: string,
    monthStart: Date,
    monthEnd: Date,
  ): Promise<EventRow[]> => {
    const votes = await prisma.vote.findMany({
      where: {
        deletedAt: null,
        board: {
          aptId: apartmentId,
          deletedAt: null,
        },
        startDate: { lte: monthEnd },
        endDate: { gte: monthStart },
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
      },
    });

    return votes.map((v) => {
      const endDate = new Date(v.endDate);
      // 종료일이 00:00이면 당일 23:59:59로 처리 (종일 이벤트)
      if (endDate.getHours() === 0 && endDate.getMinutes() === 0) {
        endDate.setHours(23, 59, 59, 999);
      }
      return {
        id: v.id,
        start: v.startDate,
        end: endDate,
        title: v.title,
        category: 'POLL',
        type: 'POLL' as const,
      };
    });
  };
}
