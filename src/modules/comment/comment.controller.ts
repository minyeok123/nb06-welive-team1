import { Request, Response } from 'express';
import { CommentRepo } from './comment.repo';
import { CommentService } from './comment.service';
<<<<<<< HEAD
import { commentIdSchema } from './comment.validate';
=======
import {
  createCommentSchema,
  updateCommentSchema,
  commentIdSchema,
} from './comment.validate';
>>>>>>> d23110f (feat: Notice, Comment 모듈 구현 (스키마 변경 반영))

export class CommentController {
  constructor(private commentService: CommentService) {}

  createComment = async (req: Request, res: Response) => {
<<<<<<< HEAD
    const { boardType, boardId, content } = req.body;
    const result = await this.commentService.createComment(
      { boardType, boardId, content },
      req.user,
    );
=======
    const input = createCommentSchema.parse(req.body);
    const result = await this.commentService.createComment(input, req.user);
>>>>>>> d23110f (feat: Notice, Comment 모듈 구현 (스키마 변경 반영))
    return res.status(201).json(result);
  };

  updateComment = async (req: Request, res: Response) => {
    const { commentId } = commentIdSchema.parse(req.params);
<<<<<<< HEAD
    const { boardType, boardId, content } = req.body;
    const result = await this.commentService.updateComment(
      commentId,
      { boardType, boardId, content },
      req.user,
    );
=======
    const input = updateCommentSchema.parse(req.body);
    const result = await this.commentService.updateComment(commentId, input, req.user);
>>>>>>> d23110f (feat: Notice, Comment 모듈 구현 (스키마 변경 반영))
    return res.status(200).json(result);
  };

  deleteComment = async (req: Request, res: Response) => {
    const { commentId } = commentIdSchema.parse(req.params);
    const result = await this.commentService.deleteComment(commentId, req.user);
    return res.status(200).json(result);
  };
}

const commentRepo = new CommentRepo();
const commentService = new CommentService(commentRepo);
export const commentController = new CommentController(commentService);
