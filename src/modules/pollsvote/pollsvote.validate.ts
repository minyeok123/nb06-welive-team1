import { z } from 'zod';

// URL에서 빈 문자열('')이 들어오면 undefined로 변환
const emptyToUndefined = (v: unknown) => (v === '' ? undefined : v);

// 투표하기 경로 파라미터 스키마
export const optionIdParamSchema = z.object({
  optionId: z.preprocess(emptyToUndefined, z.string().uuid()),
});
