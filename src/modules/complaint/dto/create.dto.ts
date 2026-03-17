/**
 * 민원 등록 요청 DTO
 */
export interface CreateComplaintDto {
  title: string;
  content: string;
  isPublic: boolean;
  status?: 'PENDING' | 'IN_PROGRESS' | 'DONE';
}

/**
 * 민원 수정 요청 DTO
 */
export interface UpdateComplaintDto {
  title: string;
  content: string;
  isPublic: boolean;
}

/**
 * 민원 상태 변경 요청 DTO (관리자 전용)
 */
export interface UpdateComplaintStatusDto {
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
}
