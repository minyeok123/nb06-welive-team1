import { z } from 'zod';

const emptyToUndefined = (v: unknown) => (v === '' ? undefined : v);
const pageSchema = z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1));
const limitSchema = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().min(1).max(100).default(20),
);
const booleanSchema = z
  .preprocess((value) => {
    if (value === '') return undefined;
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  }, z.boolean())
  .optional();

// 민원 등록 요청 본문 스키마 (CreateComplaintDto)
export const createComplaintSchema = z.object({
  title: z.string().trim().min(1).max(200), // 민원 제목
  content: z.string().trim().min(1).max(5000), // 민원 내용
  isPublic: z.boolean(), // 공개 여부
  boardId: z.string().uuid().optional(), // 게시판 ID(미사용, 하위 호환)
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']).optional(), // 처리 상태
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;

// 민원 목록 조회 쿼리 스키마
export const listComplaintsSchema = z.object({
  page: pageSchema.optional(), // 페이지 번호
  limit: limitSchema.optional(), // 페이지 크기
  status: z.preprocess(
    emptyToUndefined,
    z.enum(['PENDING', 'IN_PROGRESS', 'DONE', 'RESOLVED', 'REJECTED']).optional(),
  ), // 처리 상태
  isPublic: booleanSchema.optional(), // 공개 여부
  dong: z.preprocess(emptyToUndefined, z.coerce.number().int().optional()), // 동
  ho: z.preprocess(emptyToUndefined, z.coerce.number().int().optional()), // 호
  keyword: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()), // 제목/내용 검색어
});

export type ListComplaintsQuery = z.infer<typeof listComplaintsSchema>;

// 민원 상세 조회 경로 파라미터 스키마
export const complaintIdParamSchema = z.object({
  complaintId: z.string().uuid(), // 민원 ID
});

export type ComplaintIdParam = z.infer<typeof complaintIdParamSchema>;

// 민원 수정 요청 본문 스키마
export const updateComplaintSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(), // 민원 제목
  content: z.string().trim().min(1).max(5000).optional(), // 민원 내용
  isPublic: z.boolean().optional(), // 공개 여부
});

export type UpdateComplaintInput = z.infer<typeof updateComplaintSchema>;

// 민원 상태 변경 요청 본문 스키마(관리자 전용)
export const updateComplaintStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED']), // 처리 상태
});

export type UpdateComplaintStatusInput = z.infer<typeof updateComplaintStatusSchema>;
