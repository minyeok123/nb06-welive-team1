import { Request, Response } from 'express';
import { NotificationRepo } from '@modules/notification/notification.repo';
import { NotificationService } from '@modules/notification/notification.service';
import {
  notificationIdSchema,
  getNotificationsQuerySchema,
} from '@modules/notification/notification.validate';

/** API 명세: 30초마다 읽지 않은 알림 실시간 수신 */
const SSE_POLL_INTERVAL_MS = 30000;

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  getNotifications = async (req: Request, res: Response) => {
    const query = getNotificationsQuerySchema.parse(req.query);
    const result = await this.notificationService.getNotifications(req.user!.id, query);
    return res.status(200).json(result);
  };

  sse = async (req: Request, res: Response) => {
    const userId = req.user!.id;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const sendNotifications = async () => {
      try {
        const notifications = await this.notificationService.getUnreadNotifications(userId);
        res.write(
          `event: alarm\ndata: ${JSON.stringify(notifications)}\n\n`,
        );
      } catch (err) {
        res.write(`event: error\ndata: ${JSON.stringify({ message: '알림 조회 실패' })}\n\n`);
      }
    };

    await sendNotifications();

    const intervalId = setInterval(async () => {
      if (res.writableEnded) {
        clearInterval(intervalId);
        return;
      }
      await sendNotifications();
    }, SSE_POLL_INTERVAL_MS);

    req.on('close', () => {
      clearInterval(intervalId);
    });
  };

  markAsRead = async (req: Request, res: Response) => {
    const { notificationId } = notificationIdSchema.parse(req.params);
    const result = await this.notificationService.markAsRead(notificationId, req.user!.id);
    return res.status(200).json(result);
  };

  markAllAsRead = async (req: Request, res: Response) => {
    const result = await this.notificationService.markAllAsRead(req.user!.id);
    return res.status(200).json(result);
  };
}

const notificationRepo = new NotificationRepo();
const notificationService = new NotificationService(notificationRepo);
export const notificationController = new NotificationController(notificationService);
