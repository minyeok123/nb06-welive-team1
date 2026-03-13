import { z } from 'zod';

// 투표하기 경로 파라미터 스키마
export const optionIdParamSchema = z.object({
  optionId: z.string().uuid(),
});
