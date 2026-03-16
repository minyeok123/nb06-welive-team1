/**
 * Notification 모듈 테스트 스크립트
 * 실행: npx ts-node -r tsconfig-paths/register scripts/test-notification.ts
 */
import { prisma } from '@libs/prisma';
import { NotificationRepo } from '../src/modules/notification/notification.repo';
import { NotificationService } from '../src/modules/notification/notification.service';

async function main() {
  console.log('=== Notification 모듈 테스트 시작 ===\n');

  const notificationRepo = new NotificationRepo();
  const notificationService = new NotificationService(notificationRepo);

  try {
    // 테스트용 유저 조회
    const user = await prisma.user.findFirst({
      where: { deletedAt: null },
    });

    if (!user) {
      console.log('⚠️  테스트용 유저가 없습니다. scripts/seed-test-data.ts 를 먼저 실행하세요.');
      process.exit(1);
    }

    console.log('✓ 테스트 유저 확인:', user.id, user.name);

    // 1. 알림 목록 조회 (빈 목록일 수 있음)
    console.log('\n--- 알림 목록 조회 테스트 ---');
    const listResult = await notificationService.getNotifications(user.id, {
      page: 1,
      limit: 10,
      isRead: undefined,
    });
    console.log(`✓ 목록 조회 성공: ${listResult.notifications.length}건, totalCount: ${listResult.totalCount}`);

    // 2. 읽지 않은 알림 조회 (SSE용)
    console.log('\n--- 읽지 않은 알림 조회 테스트 ---');
    const unreadResult = await notificationService.getUnreadNotifications(user.id);
    console.log(`✓ 읽지 않은 알림: ${unreadResult.length}건`);

    // 3. 테스트용 알림이 없으면 생성
    const board = await prisma.board.findFirst({
      where: { boardType: 'NOTICE' },
    });
    if (board && unreadResult.length === 0) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          boardId: board.id,
          message: '[테스트] Notification 모듈 검증용 알림',
          notificationType: 'NOTICE_REG',
          notificatedAt: new Date(),
        },
      });
      console.log('✓ 테스트 알림 생성');
    }

    const unreadAfter = await notificationService.getUnreadNotifications(user.id);
    if (unreadAfter.length > 0) {
      const notificationId = unreadAfter[0].notificationId;
      const marked = await notificationService.markAsRead(notificationId, user.id);
      console.log('\n--- 개별 읽음 처리 테스트 ---');
      console.log('✓ 읽음 처리 성공:', marked.notificationId);

      const allReadResult = await notificationService.markAllAsRead(user.id);
      console.log('\n--- 전체 읽음 처리 테스트 ---');
      console.log('✓ 전체 읽음:', allReadResult.message);
    } else {
      console.log('\n--- 읽음 처리 테스트 (알림 없음, 스킵) ---');
    }

    console.log('\n=== 모든 테스트 통과 ===');
  } catch (error) {
    console.error('\n✗ 테스트 실패:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
