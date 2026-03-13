import { z } from 'zod';

// URL 쿼리에서 빈 문자열('')이 들어오면 undefined로 변환
const emptyToUndefined = (v: unknown) => (v === '' ? undefined : v);

// 이벤트 목록 조회 쿼리 스키마 (아파트 ID, 연도, 월)
export const listEventsQuerySchema = z.object({
  apartmentId: z.preprocess(emptyToUndefined, z.string().uuid()),
  year: z.preprocess(emptyToUndefined, z.coerce.number().int().min(2000).max(2100)),
  month: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(12)),
});

export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
