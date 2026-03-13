/**
 * Notice & Comment 테스트용 시드 데이터
 * 실행: npx ts-node -r tsconfig-paths/register scripts/seed-test-data.ts
 */
import { prisma } from '../src/libs/prisma';
import * as bcrypt from 'bcrypt';

async function main() {
  // 아파트가 있는지 확인
  let apt = await prisma.apartment.findFirst();
  if (!apt) {
    apt = await prisma.apartment.create({
      data: {
        aptName: '테스트 아파트',
        aptAddress: '서울시 테스트동 1',
        officeNumber: '02-1234-5678',
        description: '테스트용',
        startComplexNumber: 1,
        endComplexNumber: 1,
        startDongNumber: 1,
        endDongNumber: 1,
        startFloorNumber: 1,
        endFloorNumber: 10,
        startHoNumber: 101,
        endHoNumber: 110,
      },
    });
    console.log('아파트 생성:', apt.id);
  }

  // NOTICE 보드가 있는지 확인
  let board = await prisma.board.findFirst({
    where: { aptId: apt.id, boardType: 'NOTICE' },
  });
  if (!board) {
    board = await prisma.board.create({
      data: { aptId: apt.id, boardType: 'NOTICE' },
    });
    console.log('NOTICE 보드 생성:', board.id);
  }

  // 테스트 유저가 있는지 확인
  let user = await prisma.user.findFirst({
    where: { aptId: apt.id, deletedAt: null },
  });
  if (!user) {
    const hashedPassword = await bcrypt.hash('test1234', 10);
    user = await prisma.user.create({
      data: {
        username: 'testnotice',
        name: '테스트유저',
        email: 'testnotice@test.com',
        phoneNumber: '010-1234-5678',
        password: hashedPassword,
        role: 'ADMIN',
        register_status: 'APPROVED',
        aptId: apt.id,
      },
    });
    console.log('테스트 유저 생성:', user.id, '(username: testnotice, password: test1234)');
  }

  console.log('\n시드 완료. 테스트 실행: npx ts-node -r tsconfig-paths/register scripts/test-notice-comment.ts');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
