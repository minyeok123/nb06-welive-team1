/**
 * Prisma 시드 — 로컬/개발용 초기 데이터
 *
 * 하는 일:
 *   - 슈퍼 관리자·아파트 관리자·입주민(USER) 계정을 만든다(이미 있으면 해당 단계만 건너뜀).
 *   - 모든 아파트에 공지/투표/민원 게시판(NOTICE, VOTE, COMPLAINT)이 없으면 채운다.
 *     (정식 가입 승인 플로우 없이 만든 DB에서는 게시판이 비어 로그인 응답의 boardIds가 비는 문제 방지)
 *
 * 실행:
 *   npx prisma db seed
 *   또는 package.json 의 "db:seed"
 *
 * 환경 변수(선택, 없으면 아래 기본값):
 *   SEED_PASSWORD           — 공통 평문 비밀번호(로그인 API 규칙 8~15자 권장)
 *   SEED_SUPER_*            — 슈퍼관리자 username / email / phone
 *   SEED_ADMIN_*            — 관리자 username / email / phone
 *   SEED_RESIDENT{1..8}_*        — 입주민(단독·세대주 등) username / email / phone
 *   SEED_RESIDENT101_MATE_* 등  — 동일 호 세대원(아래 mate 행과 매칭)
 */
import { BoardType, PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/** 로그인 API 비밀번호 규칙: 8~15자 */
const DEFAULT_PASSWORD = process.env.SEED_PASSWORD ?? 'admin1234';

/**
 * 시드용 아파트 1개 보장.
 * DB에 삭제되지 않은 아파트가 하나라도 있으면 그중 첫 번째를 쓰고,
 * 없으면 고정 주소/관리번호로 테스트 아파트를 새로 만든다.
 */
async function ensureSeedApartment() {
  let apt = await prisma.apartment.findFirst({ where: { deletedAt: null } });
  if (!apt) {
    apt = await prisma.apartment.create({
      data: {
        aptName: '시드 테스트 아파트',
        aptAddress: 'welive-seed-address-0001',
        officeNumber: '09999900001',
        description: '개발용 시드 아파트',
        startComplexNumber: 1,
        endComplexNumber: 1,
        startDongNumber: 1,
        endDongNumber: 10,
        startFloorNumber: 1,
        endFloorNumber: 10,
        startHoNumber: 101,
        endHoNumber: 999,
        aptStatus: 'APPROVED',
      },
    });
    console.log(`[생성] 테스트 아파트: ${apt.aptName} (${apt.id})`);
  }
  return apt;
}

/** 한 아파트에 공지·투표·민원 게시판 3종이 없으면 각각 생성 */
async function ensureThreeBoardsForApartment(aptId: string) {
  const types: BoardType[] = [BoardType.NOTICE, BoardType.VOTE, BoardType.COMPLAINT];
  for (const boardType of types) {
    const exists = await prisma.board.findFirst({
      where: { aptId, boardType, deletedAt: null },
    });
    if (!exists) {
      await prisma.board.create({ data: { aptId, boardType } });
    }
  }
}

/** 삭제되지 않은 모든 아파트에 대해 위 3종 게시판 보강(이미 있으면 추가 안 함) */
async function ensureBoardsForAllApartments() {
  const apts = await prisma.apartment.findMany({
    where: { deletedAt: null },
    select: { id: true, aptName: true },
  });
  for (const { id, aptName } of apts) {
    const before = await prisma.board.count({ where: { aptId: id, deletedAt: null } });
    await ensureThreeBoardsForApartment(id);
    const after = await prisma.board.count({ where: { aptId: id, deletedAt: null } });
    if (after > before) {
      console.log(`[생성] 게시판 보강: ${aptName} (${id}) — ${after - before}개 추가`);
    }
  }
}

async function main() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);

  // --- 슈퍼 관리자: aptId 없음, 전역 운영 계정 ---
  const superUsername = process.env.SEED_SUPER_USERNAME ?? 'superadmin';
  const superEmail = process.env.SEED_SUPER_EMAIL ?? 'superadmin@welive.local';
  const superPhone = process.env.SEED_SUPER_PHONE ?? '01000000001';

  const existingSuper = await prisma.user.findUnique({ where: { username: superUsername } });
  if (!existingSuper) {
    await prisma.user.create({
      data: {
        username: superUsername,
        password: hashedPassword,
        name: '시드 슈퍼관리자',
        email: superEmail,
        phoneNumber: superPhone,
        role: 'SUPER_ADMIN',
        register_status: 'APPROVED',
      },
    });
    console.log(`[생성] SUPER_ADMIN  username: ${superUsername}  password: ${DEFAULT_PASSWORD}`);
  } else {
    console.log(`[건너뜀] SUPER_ADMIN 이미 있음: ${superUsername}`);
  }

  // --- 아파트 관리자: ensureSeedApartment() 가리키는 단지에 소속 ---
  const adminUsername = process.env.SEED_ADMIN_USERNAME ?? 'admin';
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@welive.local';
  const adminPhone = process.env.SEED_ADMIN_PHONE ?? '01000000002';

  const existingAdmin = await prisma.user.findUnique({ where: { username: adminUsername } });
  if (!existingAdmin) {
    const apt = await ensureSeedApartment();

    await prisma.user.create({
      data: {
        username: adminUsername,
        password: hashedPassword,
        name: '시드 관리자',
        email: adminEmail,
        phoneNumber: adminPhone,
        role: 'ADMIN',
        register_status: 'APPROVED',
        aptId: apt.id,
      },
    });
    console.log(`[생성] ADMIN  username: ${adminUsername}  password: ${DEFAULT_PASSWORD}`);
    console.log(`        소속 아파트: ${apt.aptName}`);
  } else {
    console.log(`[건너뜀] ADMIN 이미 있음: ${adminUsername}`);
  }

  // 입주민은 동일 시드 아파트에 묶음 (기존 DB에 아파트만 있으면 그중 첫 단지)
  const apt = await ensureSeedApartment();

  // residentRoster.adminId: 해당 apt의 ADMIN 우선, 없으면 아무 ADMIN, 그다음 SUPER_ADMIN
  const rosterAdmin =
    (await prisma.user.findFirst({
      where: { role: 'ADMIN', aptId: apt.id, deletedAt: null },
    })) ??
    (await prisma.user.findFirst({ where: { role: 'ADMIN', deletedAt: null } })) ??
    (await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN', deletedAt: null } }));

  const residentsToSeed = [
    {
      username: process.env.SEED_RESIDENT1_USERNAME ?? 'resident1',
      email: process.env.SEED_RESIDENT1_EMAIL ?? 'resident1@welive.local',
      phone: process.env.SEED_RESIDENT1_PHONE ?? '01000000011',
      name: '시드 입주민 (세대주)',
      dong: 1,
      ho: 101,
      is_houseHold: 'HOUSEHOLDER' as const,
    },
    // 1동 101 — 세대주(resident1)와 동일 호 세대원
    {
      username: process.env.SEED_RESIDENT101_MATE_USERNAME ?? 'resident101_mate',
      email: process.env.SEED_RESIDENT101_MATE_EMAIL ?? 'resident101_mate@welive.local',
      phone: process.env.SEED_RESIDENT101_MATE_PHONE ?? '01000000021',
      name: '시드 입주민 (1동 101 세대원)',
      dong: 1,
      ho: 101,
      is_houseHold: 'MEMBER' as const,
    },
    {
      username: process.env.SEED_RESIDENT2_USERNAME ?? 'resident2',
      email: process.env.SEED_RESIDENT2_EMAIL ?? 'resident2@welive.local',
      phone: process.env.SEED_RESIDENT2_PHONE ?? '01000000012',
      name: '시드 입주민 2',
      dong: 2,
      ho: 201,
      is_houseHold: 'HOUSEHOLDER' as const,
    },
    {
      username: process.env.SEED_RESIDENT201_MATE_USERNAME ?? 'resident201_mate',
      email: process.env.SEED_RESIDENT201_MATE_EMAIL ?? 'resident201_mate@welive.local',
      phone: process.env.SEED_RESIDENT201_MATE_PHONE ?? '01000000022',
      name: '시드 입주민 (2동 201 세대원)',
      dong: 2,
      ho: 201,
      is_houseHold: 'MEMBER' as const,
    },
    // 1동 102호: 세대원(MEMBER)만 시드함. 101호처럼 세대주+세대원 쌍이 아니라,
    // 「한 호에 세대원 계정만 있는」 케이스를 두기 위함(실제로는 세대주가 따로 있을 수 있음).
    {
      username: process.env.SEED_RESIDENT3_USERNAME ?? 'resident3',
      email: process.env.SEED_RESIDENT3_EMAIL ?? 'resident3@welive.local',
      phone: process.env.SEED_RESIDENT3_PHONE ?? '01000000013',
      name: '시드 입주민 (1동 102 세대원)',
      dong: 1,
      ho: 102,
      is_houseHold: 'MEMBER' as const,
    },
    {
      username: process.env.SEED_RESIDENT4_USERNAME ?? 'resident4',
      email: process.env.SEED_RESIDENT4_EMAIL ?? 'resident4@welive.local',
      phone: process.env.SEED_RESIDENT4_PHONE ?? '01000000014',
      name: '시드 입주민 (2동 202)',
      dong: 2,
      ho: 202,
      is_houseHold: 'MEMBER' as const,
    },
    {
      username: process.env.SEED_RESIDENT5_USERNAME ?? 'resident5',
      email: process.env.SEED_RESIDENT5_EMAIL ?? 'resident5@welive.local',
      phone: process.env.SEED_RESIDENT5_PHONE ?? '01000000015',
      name: '시드 입주민 (3동 301 세대주)',
      dong: 3,
      ho: 301,
      is_houseHold: 'HOUSEHOLDER' as const,
    },
    {
      username: process.env.SEED_RESIDENT301_MATE_USERNAME ?? 'resident301_mate',
      email: process.env.SEED_RESIDENT301_MATE_EMAIL ?? 'resident301_mate@welive.local',
      phone: process.env.SEED_RESIDENT301_MATE_PHONE ?? '01000000023',
      name: '시드 입주민 (3동 301 세대원)',
      dong: 3,
      ho: 301,
      is_houseHold: 'MEMBER' as const,
    },
    {
      username: process.env.SEED_RESIDENT6_USERNAME ?? 'resident6',
      email: process.env.SEED_RESIDENT6_EMAIL ?? 'resident6@welive.local',
      phone: process.env.SEED_RESIDENT6_PHONE ?? '01000000016',
      name: '시드 입주민 (3동 302)',
      dong: 3,
      ho: 302,
      is_houseHold: 'MEMBER' as const,
    },
    {
      username: process.env.SEED_RESIDENT7_USERNAME ?? 'resident7',
      email: process.env.SEED_RESIDENT7_EMAIL ?? 'resident7@welive.local',
      phone: process.env.SEED_RESIDENT7_PHONE ?? '01000000017',
      name: '시드 입주민 (4동 401)',
      dong: 4,
      ho: 401,
      is_houseHold: 'HOUSEHOLDER' as const,
    },
    {
      username: process.env.SEED_RESIDENT401_MATE_USERNAME ?? 'resident401_mate',
      email: process.env.SEED_RESIDENT401_MATE_EMAIL ?? 'resident401_mate@welive.local',
      phone: process.env.SEED_RESIDENT401_MATE_PHONE ?? '01000000024',
      name: '시드 입주민 (4동 401 세대원)',
      dong: 4,
      ho: 401,
      is_houseHold: 'MEMBER' as const,
    },
    {
      username: process.env.SEED_RESIDENT8_USERNAME ?? 'resident8',
      email: process.env.SEED_RESIDENT8_EMAIL ?? 'resident8@welive.local',
      phone: process.env.SEED_RESIDENT8_PHONE ?? '01000000018',
      name: '시드 입주민 (5동 501)',
      dong: 5,
      ho: 501,
      is_houseHold: 'HOUSEHOLDER' as const,
    },
    {
      username: process.env.SEED_RESIDENT501_MATE_USERNAME ?? 'resident501_mate',
      email: process.env.SEED_RESIDENT501_MATE_EMAIL ?? 'resident501_mate@welive.local',
      phone: process.env.SEED_RESIDENT501_MATE_PHONE ?? '01000000025',
      name: '시드 입주민 (5동 501 세대원)',
      dong: 5,
      ho: 501,
      is_houseHold: 'MEMBER' as const,
    },
  ];

  // --- 입주민: User + Resident + (가능하면) 관리자 명부 residentRoster 연결 ---
  for (const r of residentsToSeed) {
    const existing = await prisma.user.findUnique({ where: { username: r.username } });
    if (existing) {
      console.log(`[건너뜀] 입주민 이미 있음: ${r.username}`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        username: r.username,
        password: hashedPassword,
        name: r.name,
        email: r.email,
        phoneNumber: r.phone,
        role: 'USER',
        register_status: 'APPROVED',
        aptId: apt.id,
        resident: {
          create: {
            apartment: { connect: { id: apt.id } },
            dong: r.dong,
            ho: r.ho,
            is_houseHold: r.is_houseHold,
          },
        },
      },
    });

    if (rosterAdmin) {
      await prisma.residentRoster.create({
        data: {
          apartment: { connect: { id: apt.id } },
          admin: { connect: { id: rosterAdmin.id } },
          user: { connect: { id: user.id } },
          dong: r.dong,
          ho: r.ho,
          name: r.name,
          phoneNumber: r.phone,
          is_registered: true,
          is_residence: true,
          is_houseHold: r.is_houseHold,
        },
      });
    }

    console.log(
      `[생성] USER(입주민) username: ${r.username}  password: ${DEFAULT_PASSWORD}  동/호: ${r.dong}-${r.ho}`,
    );
  }

  await ensureBoardsForAllApartments();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
