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

// 투표 목록 조회 쿼리 스키마
const emptyToUndefined = (v: unknown) => (v === '' ? undefined : v);
const pageSchema = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().min(1).default(1),
);
const limitSchema = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().min(1).max(100).default(11),
);

export const listPollsSchema = z.object({
  page: pageSchema.optional(), // 페이지 번호 (기본값: 1)
  limit: limitSchema.optional(), // 한 페이지당 항목 수 (기본값: 11)
  buildingPermission: z.preprocess(emptyToUndefined, z.coerce.number().int().min(0).optional()), // 투표권자 필터 (0: 전체)
  status: z.preprocess(emptyToUndefined, z.enum(['PENDING', 'IN_PROGRESS', 'CLOSED']).optional()), // 투표 상태 (CLOSED = DONE)
  keyword: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()), // 검색어 (투표 제목, 내용)
});

export type ListPollsQuery = z.infer<typeof listPollsSchema>;

// 투표 수정 요청 본문 스키마
export const updatePollSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    content: z.string().trim().min(1).max(5000).optional(),
    buildingPermission: z.number().int().min(0).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']).optional(),
    options: z
      .array(
        z.object({
          title: z.string().trim().min(1).max(20),
        }),
      )
      .min(2)
      .max(20)
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    { message: '종료 시간은 시작 시간보다 이후여야 합니다', path: ['endDate'] },
  );

export type UpdatePollInput = z.infer<typeof updatePollSchema>;

// 투표 상세 조회 경로 파라미터 스키마
export const pollIdParamSchema = z.object({
  pollId: z.string().uuid(),
});

export type PollIdParam = z.infer<typeof pollIdParamSchema>;
