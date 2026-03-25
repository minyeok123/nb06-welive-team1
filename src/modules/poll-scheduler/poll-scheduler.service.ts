import { prisma } from '@libs/prisma';

let intervalId: ReturnType<typeof setInterval> | null = null;
let lastSuccessAt: number | null = null;
let lastError: Error | null = null;
let startedAt: number | null = null;

/**
 * 투표(Poll) 상태를 startDate / endDate 기준으로 DB에 반영한다.
 * - 종료 시각이 지난 투표 → DONE
 * - 시작됐고 아직 끝나지 않은 PENDING → IN_PROGRESS
 */
export async function runPollSchedulerTick() {
  const now = new Date();

  await prisma.poll.updateMany({
    where: {
      deletedAt: null,
      endDate: { lt: now },
      status: { in: ['PENDING', 'IN_PROGRESS'] },
    },
    data: { status: 'DONE' },
  });

  await prisma.poll.updateMany({
    where: {
      deletedAt: null,
      status: 'PENDING',
      startDate: { lte: now },
      endDate: { gte: now },
    },
    data: { status: 'IN_PROGRESS' },
  });
}

function intervalMs() {
  const n = Number(process.env.POLL_SCHEDULER_INTERVAL_MS);
  return Number.isFinite(n) && n >= 10_000 ? n : 60_000;
}

/** 서버 기동 시 한 번 호출. 테스트 환경에서는 호출하지 않는다. */
export function startPollScheduler() {
  if (intervalId !== null) return;

  const ms = intervalMs();
  startedAt = Date.now();

  void (async () => {
    try {
      await runPollSchedulerTick();
      lastSuccessAt = Date.now();
      lastError = null;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  })();

  intervalId = setInterval(async () => {
    try {
      await runPollSchedulerTick();
      lastSuccessAt = Date.now();
      lastError = null;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }, ms);
}

/** 헬스체크: 스케줄러가 돌고 있고 최근 틱이 성공했는지 */
export function isPollSchedulerHealthy(): boolean {
  if (process.env.NODE_ENV === 'test') return true;
  if (intervalId === null || startedAt === null) return false;
  if (lastError !== null) return false;
  const ms = intervalMs();
  const staleMs = ms * 5;
  if (lastSuccessAt !== null && Date.now() - lastSuccessAt < staleMs) return true;
  // 첫 비동기 틱 직후 잠깐은 아직 lastSuccessAt 이 없을 수 있음
  if (lastSuccessAt === null && Date.now() - startedAt < ms * 2) return true;
  return false;
}
