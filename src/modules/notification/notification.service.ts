import { CustomError } from '@libs/error';
import { NotificationRepo } from '@modules/notification/notification.repo';
import { GetNotificationsQuery } from '@modules/notification/notification.validate';

const toNotificationResponse = (n: {
  id: string;
  message: string;
  notificationType: string;
  notificatedAt: Date | null;
  createdAt: Date;
  is_read: boolean;
  complaintId: string | null;
  noticeId: string | null;
  voteId: string | null;
}) => ({
  notificationId: n.id,
  content: n.message,
  notificationType: n.notificationType,
  notifiedAt: n.notificatedAt?.toISOString() ?? n.createdAt.toISOString(),
  isChecked: n.is_read,
  complaintId: n.complaintId ?? undefined,
  noticeId: n.noticeId ?? undefined,
  pollId: n.voteId ?? undefined,
});

export class NotificationService {
  constructor(private repo: NotificationRepo) {}

  getUnreadNotifications = async (userId: string) => {
    const notifications = await this.repo.findUnreadByUserId(userId);
    return notifications.map(toNotificationResponse);
  };

  getNotifications = async (userId: string, query: GetNotificationsQuery) => {
    const { notifications, totalCount } = await this.repo.findManyByUserId({
      userId,
      isRead: query.isRead,
      page: query.page,
      limit: query.limit,
    });

    return {
      notifications: notifications.map(toNotificationResponse),
      totalCount,
    };
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
    return toNotificationResponse(updated);
  };

  markAllAsRead = async (userId: string) => {
    const { count } = await this.repo.markAllAsRead(userId);
    return { message: `${count}개의 알림을 읽음 처리했습니다` };
  };
}
