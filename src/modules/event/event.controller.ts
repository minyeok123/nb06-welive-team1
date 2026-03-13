import { Request, Response } from 'express';
import { EventRepo } from './event.repo';
import { EventService } from './event.service';
import { listEventsQuerySchema } from './event.validate';

// 이벤트 API 요청 핸들러
export class EventController {
  constructor(private eventService: EventService) {}

  // 이벤트 목록 조회 요청 처리
  listEvents = async (req: Request, res: Response) => {
    const query = req.validatedQuery as ReturnType<typeof listEventsQuerySchema.parse>;
    const result = await this.eventService.listEvents(query);
    return res.status(200).json(result);
  };
}

const eventRepo = new EventRepo();
const eventService = new EventService(eventRepo);
export const eventController = new EventController(eventService);
