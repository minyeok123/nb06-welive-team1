import { CustomError } from '@libs/error';
import { CommentRepo } from './comment.repo';
<<<<<<< HEAD
import { BoardType } from '@prisma/client';
import { commentResponseDto } from './dto/Response.dto';
import { withoutPasswordUser } from '@/types/user.types';
import { CreateCommentType, UpdateCommentType } from '@/types/comment.type';
=======
import { CreateCommentInput, UpdateCommentInput } from './comment.validate';

const INPUT_TO_BOARD_TYPE: Record<string, string> = {
  NOTICE: 'NOTICE',
  COMPLAINT: 'COMPLAINT',
  POLL: 'VOTE',
};
>>>>>>> d23110f (feat: Notice, Comment 모듈 구현 (스키마 변경 반영))

export class CommentService {
  constructor(private repo: CommentRepo) {}

<<<<<<< HEAD
  createComment = async (input: CreateCommentType, user: withoutPasswordUser) => {
    if (input.boardType === BoardType.COMPLAINT) {
      const complaint = await this.repo.findComplaintById(input.boardId);

      if (!complaint) throw new CustomError(404, '해당 민원글을 찾을 수 없습니다');

      if (complaint.board.aptId !== user.aptId) {
        throw new CustomError(403, '해당 아파트의 게시글에만 댓글을 작성할 수 있습니다');
      }

      const comment = await this.repo.createComplaintComment({
        userId: user.id,
        complaintId: input.boardId,
        content: input.content,
      });
      if (!comment) throw new CustomError(401, '댓글 작성을 실패했습니다.');

      return commentResponseDto(comment);
    } else if (input.boardType === BoardType.NOTICE) {
      const notice = await this.repo.findNoticeById(input.boardId);
      if (!notice) throw new CustomError(404, '해당 공지글을 찾을 수 없습니다');

      if (notice.board.aptId !== user.aptId) {
        throw new CustomError(403, '해당 아파트의 게시글에만 댓글을 작성할 수 있습니다');
      }

      const comment = await this.repo.createNoticeComment({
        userId: user.id,
        noticeId: input.boardId,
        content: input.content,
      });
      if (!comment) throw new CustomError(401, '댓글 작성을 실패했습니다.');

      return commentResponseDto(comment);
    }

    throw new CustomError(401, '댓글 작성을 실패했습니다.');
=======
  createComment = async (
    input: CreateCommentInput,
    user: { id: string; aptId: string | null },
  ) => {
    if (!user?.id || !user?.aptId) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    const board = await this.repo.findBoardById(input.boardId);
    if (!board) {
      throw new CustomError(404, '게시판을 찾을 수 없습니다');
    }
    if (board.aptId !== user.aptId) {
      throw new CustomError(403, '해당 아파트의 게시판에만 댓글을 작성할 수 있습니다');
    }

    const expectedBoardType = INPUT_TO_BOARD_TYPE[input.boardType];
    if (board.boardType !== expectedBoardType) {
      throw new CustomError(400, '게시판 타입이 일치하지 않습니다');
    }

    const comment = await this.repo.createComment({
      userId: user.id,
      boardId: input.boardId,
      content: input.content,
    });

    return {
      comment: {
        id: comment.id,
        userId: comment.userId,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        writerName: comment.user.name,
      },
      board: {
        id: comment.board.id,
        boardType: comment.board.boardType,
      },
    };
>>>>>>> d23110f (feat: Notice, Comment 모듈 구현 (스키마 변경 반영))
  };

  updateComment = async (
    commentId: string,
<<<<<<< HEAD
    input: UpdateCommentType,
    user: withoutPasswordUser,
  ) => {
    if (input.boardType === BoardType.COMPLAINT) {
      const comment = await this.repo.findComplaintCommentById(commentId);

      if (!comment) throw new CustomError(404, '댓글을 찾을 수 없습니다');

      if (comment.complaintId !== input.boardId)
        throw new CustomError(400, '게시글 정보가 일치하지 않습니다');

      if (comment.userId !== user.id) throw new CustomError(403, '수정 권한이 없습니다');

      const updatedComment = await this.repo.updateComplaintComment(commentId, input.content);

      if (!updatedComment) throw new CustomError(401, '댓글 수정을 실패했습니다.');

      return commentResponseDto(updatedComment);
    } else if (input.boardType === BoardType.NOTICE) {
      const comment = await this.repo.findNoticeCommentById(commentId);

      if (!comment) throw new CustomError(404, '댓글을 찾을 수 없습니다');

      if (comment.noticeId !== input.boardId)
        throw new CustomError(400, '게시글 정보가 일치하지 않습니다');

      if (comment.userId !== user.id) throw new CustomError(403, '수정 권한이 없습니다');

      const updatedComment = await this.repo.updateNoticeComment(commentId, input.content);

      if (!updatedComment) throw new CustomError(401, '댓글 수정을 실패했습니다.');

      return commentResponseDto(updatedComment);
    }

    throw new CustomError(401, '댓글 수정을 실패했습니다.');
  };

  deleteComment = async (commentId: string, user: withoutPasswordUser) => {
    const complaintComment = await this.repo.findComplaintCommentById(commentId);
    if (complaintComment) {
      if (complaintComment.userId !== user.id) throw new CustomError(403, '삭제 권한이 없습니다');
      await this.repo.deleteComplaintComment(commentId);
      return { message: '정상적으로 삭제 처리되었습니다' };
    }

    const noticeComment = await this.repo.findNoticeCommentById(commentId);
    if (noticeComment) {
      if (noticeComment.userId !== user.id) throw new CustomError(403, '삭제 권한이 없습니다');
      await this.repo.deleteNoticeComment(commentId);
      return { message: '정상적으로 삭제 처리되었습니다' };
    }

    throw new CustomError(404, '댓글을 찾을 수 없습니다');
=======
    input: UpdateCommentInput,
    user: { id: string },
  ) => {
    if (!user?.id) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    const comment = await this.repo.findCommentById(commentId);
    if (!comment) {
      throw new CustomError(404, '댓글을 찾을 수 없습니다');
    }
    if (comment.userId !== user.id) {
      throw new CustomError(403, '수정 권한이 없습니다');
    }
    if (comment.boardId !== input.boardId) {
      throw new CustomError(400, '게시판 정보가 일치하지 않습니다');
    }

    const updated = await this.repo.updateComment(commentId, input.content);

    return {
      comment: {
        id: updated.id,
        userId: updated.userId,
        content: updated.content,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        writerName: updated.user.name,
      },
      board: {
        id: updated.board.id,
        boardType: updated.board.boardType,
      },
    };
  };

  deleteComment = async (commentId: string, user: { id: string; aptId: string | null }) => {
    if (!user?.id) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    const comment = await this.repo.findCommentById(commentId);
    if (!comment) {
      throw new CustomError(404, '댓글을 찾을 수 없습니다');
    }
    if (comment.userId !== user.id) {
      throw new CustomError(403, '삭제 권한이 없습니다');
    }

    await this.repo.deleteComment(commentId);
    return { message: '정상적으로 삭제 처리되었습니다' };
>>>>>>> d23110f (feat: Notice, Comment 모듈 구현 (스키마 변경 반영))
  };
}
