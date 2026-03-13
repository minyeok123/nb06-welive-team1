import { Request, Response } from 'express';
import { NotificationRepo } from './notification.repo';
import { NotificationService } from './notification.service';

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  sse = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const sendNotifications = async () => {
      try {
        const notifications = await this.notificationService.getUnreadNotifications(userId);
        res.write(
          `data: ${JSON.stringify({ type: 'alarm', data: notifications })}\n\n`,
        );
      } catch (err) {
        res.write(`data: ${JSON.stringify({ type: 'error', message: '알림 조회 실패' })}\n\n`);
      }
    };

    await sendNotifications();

    const intervalId = setInterval(async () => {
      if (res.writableEnded) {
        clearInterval(intervalId);
        return;
      }
      await sendNotifications();
    }, 30000);

    req.on('close', () => {
      clearInterval(intervalId);
    });
  };

  markAsRead = async (req: Request, res: Response) => {
    const { notificationid } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다' });
    }

    const result = await this.notificationService.markAsRead(notificationid, userId);
    return res.status(200).json(result);
  };
}

const notificationRepo = new NotificationRepo();
const notificationService = new NotificationService(notificationRepo);
export const notificationController = new NotificationController(notificationService);
