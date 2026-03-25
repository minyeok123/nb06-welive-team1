import { IsPublic, Status } from '@prisma/client';
import { CustomError } from '@libs/error';
import {
  ComplaintDetailWithRelations,
  ComplaintRepo,
  ComplaintWithRelations,
} from './complaint.repo';
import {
  type CreateComplaintDto,
  type UpdateComplaintDto,
  type UpdateComplaintStatusDto,
  complaintCreateResponseDto,
  complaintDeleteResponseDto,
  complaintDetailResponseDto,
  complaintListResponseDto,
} from './dto/response.dto';
import { ListComplaintsQuery } from './complaint.validate';

export class ComplaintService {
  constructor(private repo: ComplaintRepo) {}

  createComplaint = async (params: {
    input: CreateComplaintDto;
    user: { id: string; aptId: string | null };
  }) => {
    const { input, user } = params;
    if (!user?.id || !user?.aptId) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    // 아파트별 할당된 민원 게시판 조회 (없으면 최초 1회 생성)
    const board = await this.repo.findOrCreateComplaintBoardForApartment(user.aptId);

    const complaint = await this.repo.createComplaint({
      boardId: board.id,
      authorId: user.id,
      title: input.title,
      content: input.content,
      status: input.status ?? Status.PENDING,
      isPublic: input.isPublic,
    });

    // 동일 아파트 관리자에게 알림 전송
    const admins = await this.repo.findAdminsByApartment(user.aptId);
    await this.repo.createComplaintNotifications({
      boardId: board.id,
      complaintId: complaint.id,
      userIds: admins.map((admin) => admin.id),
      message: `새 민원이 등록되었습니다: ${input.title}`,
    });

    return complaintCreateResponseDto();
  };

  listComplaints = async (params: {
    query: ListComplaintsQuery;
    user: { id: string; aptId: string | null; role: string };
  }) => {
    const { query, user } = params;
    if (!user?.id) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    // 관리자 여부 확인
    const isAdmin = user.role === 'SUPER_ADMIN';
    if (isAdmin) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    if (query.status === 'REJECTED') {
      // 스펙: REJECTED는 조회 결과에서 제외
      return { complaints: [], totalCount: 0 };
    }

    // RESOLVED는 DONE으로 매핑
    const statusFilter = query.status === 'RESOLVED' ? 'DONE' : query.status;

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

    const complaints = (items as ComplaintWithRelations[]).map((item) =>
      complaintListResponseDto(item, IsPublic),
    );

    return { complaints, totalCount };
  };

  getComplaint = async (params: {
    complaintId: string;
    user: { id: string; aptId: string | null; role: string };
  }) => {
    const { complaintId, user } = params;
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

    return complaintDetailResponseDto(complaint as ComplaintDetailWithRelations, IsPublic);
  };

  updateComplaint = async (params: {
    complaintId: string;
    input: UpdateComplaintDto;
    user: { id: string; aptId: string | null };
  }) => {
    const { complaintId, input, user } = params;
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

    return complaintListResponseDto(updated, IsPublic);
  };

  deleteComplaint = async (params: { complaintId: string; user: { id: string } }) => {
    const { complaintId, user } = params;
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

    return complaintDeleteResponseDto();
  };

  updateComplaintStatus = async (params: {
    complaintId: string;
    input: UpdateComplaintStatusDto;
    user: { id: string; aptId: string | null; role: string };
  }) => {
    const { complaintId, input, user } = params;
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

    return complaintDetailResponseDto(updated, IsPublic);
  };
}
