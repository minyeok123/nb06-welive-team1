import { z } from 'zod';

// 투표 등록 요청 본문 스키마
export const createPollSchema = z
  .object({
    boardId: z.string().uuid(), // 게시판 고유 ID (민원, 투표, 공지 중 하나)
    status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']).default('IN_PROGRESS'), // 투표 상태
    title: z.string().trim().min(1).max(200), // 투표 제목
    content: z.string().trim().min(1).max(5000), // 투표 내용
    buildingPermission: z.number().int().min(0), // 투표권자 범위 (0: 전체, 그 외: 특정 동)
    startDate: z.string().datetime(), // 투표 시작 시간
    endDate: z.string().datetime(), // 투표 종료 시간
    options: z
      .array(
        z.object({
          title: z.string().trim().min(1).max(20), // 투표 선택지 제목
        }),
      )
      .min(2)
      .max(20), // 투표 선택지 (최소 2개, 최대 20개)
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: '종료 시간은 시작 시간보다 이후여야 합니다',
    path: ['endDate'],
  });

// 투표 등록 입력 타입
export type CreatePollInput = z.infer<typeof createPollSchema>;
