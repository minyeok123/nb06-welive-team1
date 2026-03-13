import { CustomError } from '@libs/error';
import { NotificationRepo } from './notification.repo';

export class NotificationService {
  constructor(private repo: NotificationRepo) {}

  getUnreadNotifications = async (userId: string) => {
    const notifications = await this.repo.findUnreadByUserId(userId);
    return notifications.map((n) => ({
      notificationId: n.id,
      content: n.message,
      notificationType: n.notificationType,
      notifiedAt: n.notificatedAt?.toISOString() ?? n.createdAt.toISOString(),
      isChecked: n.is_read,
      complaintId: n.complaintId ?? undefined,
      noticeId: n.noticeId ?? undefined,
      pollId: n.voteId ?? undefined,
    }));
  };

  markAsRead = async (notificationId: string, userId: string) => {
    const notification = await this.repo.findById(notificationId);
    if (!notification) {
      throw new CustomError(404, '알림을 찾을 수 없습니다');
    }
    if (notification.userId !== userId) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    const updated = await this.repo.markAsRead(notificationId);
    return {
      notificationId: updated.id,
      content: updated.message,
      notificationType: updated.notificationType,
      notifiedAt: updated.notificatedAt?.toISOString() ?? updated.createdAt.toISOString(),
      isChecked: updated.is_read,
      complaintId: updated.complaintId ?? undefined,
      noticeId: updated.noticeId ?? undefined,
      pollId: updated.voteId ?? undefined,
    };
  };
}
