import { IsPublic } from '@prisma/client';
import { ComplaintWithRelations, ComplaintDetailWithRelations } from '../complaint.repo';

/** 민원 목록 항목 응답 DTO */
export interface ComplaintListResponseDto {
  complaintId: string;
  userId: string;
  title: string;
  writerName: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  viewsCount: number;
  commentsCount: number;
  status: string;
  dong: string | undefined;
  ho: string | undefined;
}

/** 민원 상세 응답 DTO */
export interface ComplaintDetailResponseDto {
  complaintId: string;
  userId: string;
  title: string;
  writerName: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  viewsCount: number;
  commentsCount: number;
  status: string;
  dong: string | undefined;
  ho: string | undefined;
  content: string;
  boardType: string;
  comments: {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    writerName: string;
  }[];
}

/** 민원 등록 응답 DTO */
export interface ComplaintCreateResponseDto {
  message: string;
}

/** 민원 삭제 응답 DTO */
export interface ComplaintDeleteResponseDto {
  message: string;
}

/** 민원 목록 결과 DTO */
export interface ComplaintListResultDto {
  complaints: ComplaintListResponseDto[];
  totalCount: number;
}

/**
 * 민원 목록 항목 → 응답 DTO 변환
 */
export const complaintListResponseDto = (
  item: ComplaintWithRelations,
  isPublicEnum: typeof IsPublic,
): ComplaintListResponseDto => ({
  complaintId: item.id,
  userId: item.authorId,
  title: item.title,
  writerName: item.author?.name ?? '',
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString(),
  isPublic: item.is_public === isPublicEnum.PUBLIC,
  viewsCount: 0,
  commentsCount: item._count?.complaintComment ?? 0,
  status: item.status === 'DONE' ? 'RESOLVED' : item.status,
  dong: item.author?.resident?.dong?.toString(),
  ho: item.author?.resident?.ho?.toString(),
});

/**
 * 민원 상세 → 응답 DTO 변환
 */
export const complaintDetailResponseDto = (
  detail: ComplaintDetailWithRelations,
  isPublicEnum: typeof IsPublic,
): ComplaintDetailResponseDto => {
  const comments = detail.complaintComment ?? [];
  return {
    complaintId: detail.id,
    userId: detail.authorId,
    title: detail.title,
    writerName: detail.author?.name ?? '',
    createdAt: detail.createdAt.toISOString(),
    updatedAt: detail.updatedAt.toISOString(),
    isPublic: detail.is_public === isPublicEnum.PUBLIC,
    viewsCount: 0,
    commentsCount: comments.length,
    status: detail.status === 'DONE' ? 'RESOLVED' : detail.status,
    dong: detail.author?.resident?.dong?.toString(),
    ho: detail.author?.resident?.ho?.toString(),
    content: detail.content,
    boardType: '민원',
    comments: comments.map((comment) => ({
      id: comment.id,
      userId: comment.userId,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      writerName: comment.user?.name ?? '',
    })),
  };
};

/**
 * 민원 등록 성공 응답 DTO
 */
export const complaintCreateResponseDto = (): ComplaintCreateResponseDto => ({
  message: '정상적으로 등록 처리되었습니다',
});

/**
 * 민원 삭제 성공 응답 DTO
 */
export const complaintDeleteResponseDto = (): ComplaintDeleteResponseDto => ({
  message: '정상적으로 삭제 처리되었습니다',
});
