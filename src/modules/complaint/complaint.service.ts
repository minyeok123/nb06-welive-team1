import { IsPublic, Status } from '@prisma/client';
import { CustomError } from '@libs/error';
import { ComplaintRepo, ComplaintWithRelations } from './complaint.repo';
import { CreateComplaintInput, ListComplaintsQuery } from './complaint.validate';

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

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const { items, totalCount } = await this.repo.findComplaints({
      where,
      skip,
      take: limit,
    });

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
}
