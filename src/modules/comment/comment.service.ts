import { CustomError } from '@libs/error';
import { CommentRepo } from '@modules/comment/comment.repo';
import { BoardType } from '@prisma/client';
import { commentResponseDto } from '@modules/comment/dto/Response.dto';
import { withoutPasswordUser } from '@app-types/user.types';
import { CreateCommentType, UpdateCommentType } from '@app-types/comment.type';

export class CommentService {
  constructor(private repo: CommentRepo) {}

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
  };

  updateComment = async (
    commentId: string,
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
      if (complaintComment.userId !== user.id) {
        if (user.role === 'USER') throw new CustomError(403, '삭제 권한이 없습니다');
        if (user.role === 'ADMIN' && complaintComment.complaint.board.aptId !== user.aptId)
          throw new CustomError(403, '해당 아파트의 관리자만 삭제 권한이 있습니다');
      }
      await this.repo.deleteComplaintComment(commentId);
      return { message: '정상적으로 삭제 처리되었습니다' };
    }

    const noticeComment = await this.repo.findNoticeCommentById(commentId);
    if (noticeComment) {
      if (noticeComment.userId !== user.id) {
        if (user.role === 'USER') throw new CustomError(403, '삭제 권한이 없습니다');
        if (user.role === 'ADMIN' && noticeComment.notice.board.aptId !== user.aptId)
          throw new CustomError(403, '해당 아파트의 관리자만 삭제 권한이 있습니다');
      }
      await this.repo.deleteNoticeComment(commentId);
      return { message: '정상적으로 삭제 처리되었습니다' };
    }

    throw new CustomError(404, '댓글을 찾을 수 없습니다');
  };
}
