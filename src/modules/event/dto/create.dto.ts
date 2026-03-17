/**
 * 이벤트 생성/수정 요청 DTO (쿼리 파라미터)
 */
export interface PutEventDto {
  boardType: 'NOTICE' | 'POLL';
  boardId: string;
  startDate: Date;
  endDate: Date;
}
