import { IsPublic, Status } from '@prisma/client';
import { CustomError } from '@libs/error';
import { ComplaintDetailWithRelations, ComplaintRepo, ComplaintWithRelations } from './complaint.repo';
import {
  CreateComplaintInput,
  ListComplaintsQuery,
  UpdateComplaintInput,
  UpdateComplaintStatusInput,
} from './complaint.validate';

export class ComplaintService {
  constructor(private repo: ComplaintRepo) {}

  createComplaint = async (
    input: CreateComplaintInput,
    user: { id: string; aptId: string | null },
  ) => {
    if (!user?.id || !user?.aptId) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    // 민원 등록과 게시판 생성은 트랜잭션으로 처리
    const { board, complaint } = await this.repo.createComplaintWithBoard({
      authorId: user.id,
      aptId: user.aptId,
      title: input.title,
      content: input.content,
      status: input.status ?? Status.PENDING,
      isPublic: input.isPublic,
      boardId: input.boardId,
    });

    // 동일 아파트 관리자에게 알림 전송
    const admins = await this.repo.findAdminsByApartment(user.aptId);
    await this.repo.createComplaintNotifications({
      boardId: board.id,
      complaintId: complaint.id,
      userIds: admins.map((admin) => admin.id),
      message: `새 민원이 등록되었습니다: ${input.title}`,
    });

    return { message: '정상적으로 등록 처리되었습니다' };
  };

  listComplaints = async (query: ListComplaintsQuery, user: { id: string; aptId: string | null; role: string }) => {
    if (!user?.id) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    // 관리자 여부 확인
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin && !user.aptId) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    if (query.status === 'REJECTED') {
      // 스펙: REJECTED는 조회 결과에서 제외
      return { complaints: [], totalCount: 0 };
    }

    // RESOLVED는 DONE으로 매핑
    const statusFilter =
      query.status === 'RESOLVED' ? 'DONE' : query.status;

    const where: any = {
      deletedAt: null,
    };

    if (statusFilter) {
      where.status = statusFilter;
    }

    if (typeof query.isPublic === 'boolean') {
      // 공개/비공개 필터
      where.is_public = query.isPublic ? IsPublic.PUBLIC : IsPublic.PRIVATE;
    }

    if (!isAdmin) {
      // 입주민은 공개글 또는 본인 글만 조회
      where.OR = [{ is_public: IsPublic.PUBLIC }, { authorId: user.id }];
    }

    if (user.aptId) {
      // 동일 아파트 기준 필터
      where.author = {
        ...(where.author ?? {}),
        aptId: user.aptId,
      };
    }

    if (query.dong !== undefined || query.ho !== undefined) {
      // 동/호 필터
      where.author = {
        ...(where.author ?? {}),
        resident: {
          ...(query.dong !== undefined ? { dong: query.dong } : {}),
          ...(query.ho !== undefined ? { ho: query.ho } : {}),
        },
      };
    }

    if (query.keyword) {
      // 제목/내용 키워드 검색
      where.OR = [
        ...(where.OR ?? []),
        { title: { contains: query.keyword, mode: 'insensitive' } },
        { content: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }

    // 페이징 계산
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const { items, totalCount } = await this.repo.findComplaints({
      where,
      skip,
      take: limit,
    });

    // 응답 포맷 매핑
    const complaints = (items as ComplaintWithRelations[]).map((item) => ({
      complaintId: item.id,
      userId: item.authorId,
      title: item.title,
      writerName: item.author?.name ?? '',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      isPublic: item.is_public === IsPublic.PUBLIC,
      viewsCount: 0,
      commentsCount: item.board?._count.comments ?? 0,
      status: item.status === 'DONE' ? 'RESOLVED' : item.status,
      dong: item.author?.resident?.dong?.toString(),
      ho: item.author?.resident?.ho?.toString(),
    }));

    return { complaints, totalCount };
  };

  getComplaint = async (complaintId: string, user: { id: string; aptId: string | null; role: string }) => {
    if (!user?.id) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    // 민원 상세 조회
    const complaint = await this.repo.findComplaintById(complaintId);
    if (!complaint) {
      throw new CustomError(404, '민원을 찾을 수 없습니다');
    }

    // 관리자 여부 확인
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin && complaint.is_public === IsPublic.PRIVATE && complaint.authorId !== user.id) {
      // 비공개 글은 작성자/관리자만 조회
      throw new CustomError(403, '비밀글은 확인할 수 없습니다');
    }

    if (user.aptId && complaint.author?.aptId && complaint.author.aptId !== user.aptId) {
      // 다른 아파트 민원 차단
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    return this.mapComplaintDetail(complaint as ComplaintDetailWithRelations);
  };

  updateComplaint = async (
    complaintId: string,
    input: UpdateComplaintInput,
    user: { id: string; aptId: string | null },
  ) => {
    if (!user?.id) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    // 수정 대상 조회
    const complaint = await this.repo.findComplaintById(complaintId);
    if (!complaint) {
      throw new CustomError(404, '민원을 찾을 수 없습니다');
    }

    if (complaint.authorId !== user.id) {
      // 작성자만 수정 가능
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    if (complaint.status === 'IN_PROGRESS' || complaint.status === 'DONE') {
      // 처리 중/처리 완료 민원은 수정 불가
      throw new CustomError(403, '처리 중이거나 완료된 민원은 수정할 수 없습니다');
    }

    const updated = await this.repo.updateComplaint({
      complaintId,
      title: input.title,
      content: input.content,
      isPublic: input.isPublic,
    });

    return {
      complaintId: updated.id,
      userId: updated.authorId,
      title: updated.title,
      writerName: updated.author?.name ?? '',
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      isPublic: updated.is_public === IsPublic.PUBLIC,
      viewsCount: 0,
      commentsCount: updated.board?._count.comments ?? 0,
      status: updated.status === 'DONE' ? 'RESOLVED' : updated.status,
      dong: updated.author?.resident?.dong?.toString(),
      ho: updated.author?.resident?.ho?.toString(),
    };
  };

  deleteComplaint = async (complaintId: string, user: { id: string }) => {
    if (!user?.id) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    // 삭제 대상 조회
    const complaint = await this.repo.findComplaintById(complaintId);
    if (!complaint) {
      throw new CustomError(404, '민원을 찾을 수 없습니다');
    }

    if (complaint.authorId !== user.id) {
      // 작성자만 삭제 가능
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    if (complaint.status === 'IN_PROGRESS' || complaint.status === 'DONE') {
      // 처리 중/처리 완료 민원은 삭제 불가
      throw new CustomError(403, '처리 중이거나 완료된 민원은 삭제할 수 없습니다');
    }

    await this.repo.softDeleteComplaint(complaintId);

    return { message: '정상적으로 삭제 처리되었습니다' };
  };

  updateComplaintStatus = async (
    complaintId: string,
    input: UpdateComplaintStatusInput,
    user: { id: string; aptId: string | null; role: string },
  ) => {
    if (!user?.id) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    // 관리자 여부 확인
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    const complaint = await this.repo.findComplaintById(complaintId);
    if (!complaint) {
      throw new CustomError(404, '민원을 찾을 수 없습니다');
    }

    if (user.aptId && complaint.author?.aptId && complaint.author.aptId !== user.aptId) {
      // 다른 아파트 민원 차단
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    const status = input.status === 'RESOLVED' ? Status.DONE : input.status;
    const updated = await this.repo.updateComplaintStatus({
      complaintId,
      status,
    });

    if (!updated) {
      throw new CustomError(404, '민원을 찾을 수 없습니다');
    }

    return this.mapComplaintDetail(updated);
  };

  private mapComplaintDetail = (detail: ComplaintDetailWithRelations) => {
    // 댓글 목록
    const comments = detail.board?.comments ?? [];

    return {
      complaintId: detail.id,
      userId: detail.authorId,
      title: detail.title,
      writerName: detail.author?.name ?? '',
      createdAt: detail.createdAt,
      updatedAt: detail.updatedAt,
      isPublic: detail.is_public === IsPublic.PUBLIC,
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
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        writerName: comment.user?.name ?? '',
      })),
    };
  };
}
