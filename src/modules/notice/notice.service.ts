import { CustomError } from '@libs/error';
import { NoticeRepo } from './notice.repo';
import { CreateNoticeInput, GetNoticesQuery, UpdateNoticeInput } from './notice.validate';

export class NoticeService {
  constructor(private repo: NoticeRepo) {}

  createNotice = async (
    input: CreateNoticeInput,
    user: { id: string; aptId: string | null },
  ) => {
    if (!user?.id || !user?.aptId) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    const board = await this.repo.findBoardById(input.boardId);
    if (!board) {
      throw new CustomError(404, '게시판을 찾을 수 없습니다');
    }
    if (board.boardType !== 'NOTICE') {
      throw new CustomError(400, '공지사항 게시판이 아닙니다');
    }
    if (board.aptId !== user.aptId) {
      throw new CustomError(403, '해당 아파트의 게시판에만 등록할 수 있습니다');
    }

    const notice = await this.repo.createNotice({
      boardId: input.boardId,
      authorId: user.id,
      title: input.title,
      content: input.content,
      category: input.category,
      isPinned: input.isPinned ?? false,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
    });

    const users = await this.repo.findUsersByApartment(user.aptId);
    const userIds = users.map((u) => u.id).filter((id) => id !== user.id);
    await this.repo.createNoticeNotifications({
      boardId: notice.boardId,
      noticeId: notice.id,
      userIds,
      message: `새 공지사항이 등록되었습니다: ${input.title}`,
    });

    return { message: '정상적으로 등록 처리되었습니다' };
  };

  getNotices = async (query: GetNoticesQuery, userAptId: string | null) => {
    if (!userAptId) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    const { notices, totalCount } = await this.repo.findNotices({
      aptId: userAptId,
      category: query.category,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    return {
      notices: notices.map((n) => ({
        noticeId: n.id,
        userId: n.authorId,
        category: n.category,
        title: n.title,
        writerName: n.author.name,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
        viewsCount: n.viewsCount,
<<<<<<< HEAD
        commentsCount: n._count.noticeComment,
=======
        commentsCount: n.board._count.comments,
>>>>>>> d23110f (feat: Notice, Comment 모듈 구현 (스키마 변경 반영))
        isPinned: n.is_pinned,
      })),
      totalCount,
    };
  };

  getNoticeById = async (noticeId: string, userAptId: string | null) => {
    if (!userAptId) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    const notice = await this.repo.findNoticeById(noticeId);
    if (!notice) {
      throw new CustomError(404, '공지사항을 찾을 수 없습니다');
    }

    const boardAptId = notice.board.aptId;
    if (boardAptId && boardAptId !== userAptId) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    await this.repo.incrementViewsCount(noticeId);

    return {
      noticeId: notice.id,
      userId: notice.authorId,
      category: notice.category,
      title: notice.title,
      writerName: notice.author.name,
      createdAt: notice.createdAt.toISOString(),
      updatedAt: notice.updatedAt.toISOString(),
      viewsCount: notice.viewsCount + 1,
<<<<<<< HEAD
      commentsCount: notice.noticeComment.length,
      isPinned: notice.is_pinned,
      content: notice.content,
      boardName: 'NOTICE',
      comments: notice.noticeComment.map((c) => ({
=======
      commentsCount: notice.board.comments.length,
      isPinned: notice.is_pinned,
      content: notice.content,
      boardName: 'NOTICE',
      comments: notice.board.comments.map((c) => ({
>>>>>>> d23110f (feat: Notice, Comment 모듈 구현 (스키마 변경 반영))
        id: c.id,
        userId: c.userId,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        writerName: c.user.name,
      })),
    };
  };

  updateNotice = async (
    noticeId: string,
    input: UpdateNoticeInput,
    user: { id: string; aptId: string | null },
  ) => {
    if (!user?.id || !user?.aptId) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    const notice = await this.repo.findNoticeById(noticeId);
    if (!notice) {
      throw new CustomError(404, '공지사항을 찾을 수 없습니다');
    }
    if (notice.authorId !== user.id) {
      throw new CustomError(403, '수정 권한이 없습니다');
    }

    await this.repo.updateNotice(noticeId, {
      ...(input.category && { category: input.category }),
      ...(input.title && { title: input.title }),
      ...(input.content && { content: input.content }),
      ...(input.isPinned !== undefined && { is_pinned: input.isPinned }),
      ...(input.startDate !== undefined && {
        startDate: input.startDate ? new Date(input.startDate) : null,
      }),
      ...(input.endDate !== undefined && {
        endDate: input.endDate ? new Date(input.endDate) : null,
      }),
    });

    const updated = await this.repo.findNoticeById(noticeId);
    return {
      noticeId: updated!.id,
      userId: updated!.authorId,
      category: updated!.category,
      title: updated!.title,
      writerName: updated!.author.name,
      createdAt: updated!.createdAt.toISOString(),
      updatedAt: updated!.updatedAt.toISOString(),
      viewsCount: updated!.viewsCount,
<<<<<<< HEAD
      commentsCount: updated!.noticeComment.length,
=======
      commentsCount: updated!.board.comments.length,
>>>>>>> d23110f (feat: Notice, Comment 모듈 구현 (스키마 변경 반영))
      isPinned: updated!.is_pinned,
    };
  };

  deleteNotice = async (
    noticeId: string,
    user: { id: string; aptId: string | null },
  ) => {
    if (!user?.id || !user?.aptId) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    const notice = await this.repo.findNoticeById(noticeId);
    if (!notice) {
      throw new CustomError(404, '공지사항을 찾을 수 없습니다');
    }
    if (notice.authorId !== user.id) {
      throw new CustomError(403, '삭제 권한이 없습니다');
    }

    await this.repo.softDeleteNotice(noticeId);
    return { message: '정상적으로 삭제 처리되었습니다' };
  };
}
