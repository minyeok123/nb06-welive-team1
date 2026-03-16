/**
 * Notice & Comment 모듈 테스트 스크립트
 * 실행: npx ts-node -r tsconfig-paths/register scripts/test-notice-comment.ts
 */
import { prisma } from '../src/libs/prisma';
import { NoticeRepo } from '../src/modules/notice/notice.repo';
import { NoticeService } from '../src/modules/notice/notice.service';
import { CommentRepo } from '../src/modules/comment/comment.repo';
import { CommentService } from '../src/modules/comment/comment.service';

async function main() {
  console.log('=== Notice & Comment 모듈 테스트 시작 ===\n');

  const noticeRepo = new NoticeRepo();
  const noticeService = new NoticeService(noticeRepo);
  const commentRepo = new CommentRepo();
  const commentService = new CommentService(commentRepo);

  try {
    // 1. 테스트용 데이터 조회 (아파트, 유저, NOTICE 보드)
    const board = await prisma.board.findFirst({
      where: { boardType: 'NOTICE' },
      include: { apartment: true },
    });

    if (!board) {
      console.log('⚠️  NOTICE 타입 보드가 없습니다. DB에 아파트/유저/보드가 있어야 합니다.');
      console.log('   (관리자 회원가입 승인 시 보드가 생성됩니다)');
      process.exit(1);
    }

    const user = await prisma.user.findFirst({
      where: { aptId: board.aptId, deletedAt: null },
    });

    if (!user) {
      console.log('⚠️  해당 아파트에 유저가 없습니다.');
      process.exit(1);
    }

    console.log('✓ 테스트 데이터 확인');
    console.log(`  - Board ID (NOTICE): ${board.id}`);
    console.log(`  - User ID: ${user.id}, aptId: ${user.aptId}\n`);

    // 2. Notice 생성 테스트
    console.log('--- Notice 생성 테스트 ---');
    const createResult = await noticeService.createNotice(
      {
        boardId: board.id,
        category: 'COMMUNITY',
        title: '[테스트] Notice & Comment 모듈 검증',
        content: '스키마 변경 후 정상 동작 확인을 위한 테스트 공지입니다.',
        isPinned: false,
      },
      { id: user.id, aptId: user.aptId },
    );
    console.log('✓ Notice 생성 성공:', createResult.message);

    // 3. Notice 목록 조회 테스트
    console.log('\n--- Notice 목록 조회 테스트 ---');
    const noticesResult = await noticeService.getNotices(
      { page: 1, limit: 5 },
      user.aptId,
    );
    console.log(`✓ 목록 조회 성공: ${noticesResult.notices.length}건, totalCount: ${noticesResult.totalCount}`);

    // 4. Notice 상세 조회 테스트
    const noticeId = noticesResult.notices[0]?.noticeId;
    if (noticeId) {
      console.log('\n--- Notice 상세 조회 테스트 ---');
      const detailResult = await noticeService.getNoticeById(noticeId, user.aptId);
      console.log(`✓ 상세 조회 성공: ${detailResult.title}, commentsCount: ${detailResult.commentsCount}`);
    }

    // 5. Comment 생성 테스트 (NOTICE 보드)
    console.log('\n--- Comment 생성 테스트 (NOTICE) ---');
    const commentResult = await commentService.createComment(
      {
        boardId: board.id,
        boardType: 'NOTICE',
        content: '테스트 댓글입니다. 스키마 변경 후 정상 동작 확인.',
      },
      { id: user.id, aptId: user.aptId },
    );
    console.log('✓ Comment 생성 성공:', commentResult.comment.id);

    // 6. Comment 생성 테스트 - 잘못된 boardType (에러 케이스)
    console.log('\n--- Comment boardType 검증 테스트 (에러 예상) ---');
    const wrongBoard = await prisma.board.findFirst({
      where: { boardType: 'COMPLAINT', aptId: board.aptId },
    });
    if (wrongBoard) {
      try {
        await commentService.createComment(
          { boardId: wrongBoard.id, boardType: 'NOTICE', content: '잘못된 타입' },
          { id: user.id, aptId: user.aptId },
        );
        console.log('✗ 예상과 다름: 에러가 발생했어야 함');
      } catch (e: unknown) {
        const err = e as { message?: string };
        console.log('✓ boardType 불일치 시 에러 발생 (예상대로):', err.message ?? '');
      }
    }

    // 7. 생성한 테스트 Notice 삭제 (정리)
    if (noticeId) {
      await noticeService.deleteNotice(noticeId, { id: user.id, aptId: user.aptId });
      console.log('\n✓ 테스트 Notice 삭제 완료');
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
