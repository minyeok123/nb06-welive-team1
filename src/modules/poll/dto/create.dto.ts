/**
 * 투표 등록 요청 DTO
 */
export interface CreatePollDto {
  boardId: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  title: string;
  content: string;
  buildingPermission: number; // 0: 전체 동, 그 외: 특정 동 번호
  startDate: string; // ISO datetime
  endDate: string; // ISO datetime
  options: { title: string }[];
}

/**
 * 투표 수정 요청 DTO
 */
export interface UpdatePollDto {
  title?: string;
  content?: string;
  buildingPermission?: number;
  startDate?: string;
  endDate?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  options?: { title: string }[];
}
