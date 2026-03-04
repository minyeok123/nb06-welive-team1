import { IsPublic, Status } from '@prisma/client';
import { CustomError } from '@libs/error';
import { ComplaintRepo } from './complaint.repo';
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

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin && !user.aptId) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    if (query.status === 'REJECTED') {
      return { complaints: [], totalCount: 0 };
    }

    const statusFilter =
      query.status === 'RESOLVED' ? 'DONE' : query.status;

    const where: any = {
      deletedAt: null,
    };

    if (statusFilter) {
      where.status = statusFilter;
    }

    if (typeof query.isPublic === 'boolean') {
      where.is_public = query.isPublic ? IsPublic.PUBLIC : IsPublic.PRIVATE;
    }

    if (!isAdmin) {
      where.OR = [{ is_public: IsPublic.PUBLIC }, { authorId: user.id }];
    }

    if (user.aptId) {
      where.board = {
        ...(where.board ?? {}),
        author: {
          ...(where.board?.author ?? {}),
          aptId: user.aptId,
        },
      };
    }

    if (query.dong !== undefined || query.ho !== undefined) {
      where.board = {
        ...(where.board ?? {}),
        author: {
          ...(where.board?.author ?? {}),
          resident: {
            ...(query.dong !== undefined ? { dong: query.dong } : {}),
            ...(query.ho !== undefined ? { ho: query.ho } : {}),
          },
        },
      };
    }

    if (query.keyword) {
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

    const complaints = items.map((item) => ({
      complaintId: item.id,
      userId: item.authorId,
      title: item.title,
      writerName: item.board?.author?.name ?? '',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      isPublic: item.is_public === IsPublic.PUBLIC,
      viewsCount: 0,
      commentsCount: item.board?._count.comments ?? 0,
      status: item.status === 'DONE' ? 'RESOLVED' : item.status,
      dong: item.board?.author?.resident?.dong?.toString(),
      ho: item.board?.author?.resident?.ho?.toString(),
    }));

    return { complaints, totalCount };
  };
}
