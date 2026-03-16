import { CustomError } from '@libs/error';
import { CommentRepo } from './comment.repo';
import { CreateCommentInput, UpdateCommentInput } from './comment.validate';

const INPUT_TO_BOARD_TYPE: Record<string, string> = {
  NOTICE: 'NOTICE',
  COMPLAINT: 'COMPLAINT',
  POLL: 'VOTE',
};

export class CommentService {
  constructor(private repo: CommentRepo) {}

  createComment = async (input: CreateCommentInput, user: { id: string; aptId: string | null }) => {
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
  };

  updateComment = async (commentId: string, input: UpdateCommentInput, user: { id: string }) => {
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
  };
}
