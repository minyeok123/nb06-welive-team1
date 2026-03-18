import { Request, Response } from 'express';
import type { PutEventDto } from './dto/response.dto';
import { EventRepo } from './event.repo';
import { EventService } from './event.service';
import {
  eventIdParamSchema,
  listEventsQuerySchema,
  putEventQuerySchema,
} from './event.validate';

/** 이벤트 API 컨트롤러 - 목록, 생성/수정, 삭제 */
export class EventController {
  constructor(private eventService: EventService) {}

  /** 이벤트 목록 조회 - GET /api/events (아파트, 연, 월) */
  listEvents = async (req: Request, res: Response) => {
    const query = req.validatedQuery as ReturnType<typeof listEventsQuerySchema.parse>; // 쿼리 검증
    const result = await this.eventService.listEvents(query);
    return res.status(200).json(result);
  };

  /** 이벤트 생성/수정 - PUT /api/events (관리자만) */
  putEvent = async (req: Request, res: Response) => {
    const query = req.validatedQuery as PutEventDto; // 쿼리 검증
    await this.eventService.putEvent(query, req.user);
    return res.status(204).send();
  };

  /** 이벤트 삭제 - DELETE /api/events/:eventId (관리자만) */
  deleteEvent = async (req: Request, res: Response) => {
    const params = eventIdParamSchema.parse(req.params); // 경로 파라미터 검증
    const result = await this.eventService.deleteEvent(params.eventId, req.user);
    return res.status(200).json(result);
  };
}

const eventRepo = new EventRepo();
const eventService = new EventService(eventRepo);
export const eventController = new EventController(eventService);
