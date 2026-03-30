import { Request, Response } from 'express';
import { CommentRepo } from '@modules/comment/comment.repo';
import { CommentService } from '@modules/comment/comment.service';
import { commentIdSchema } from '@modules/comment/comment.validate';

export class CommentController {
  constructor(private commentService: CommentService) {}

  createComment = async (req: Request, res: Response) => {
    const { boardType, boardId, content } = req.body;
    const result = await this.commentService.createComment(
      { boardType, boardId, content },
      req.user,
    );
    return res.status(201).json(result);
  };

  updateComment = async (req: Request, res: Response) => {
    const { commentId } = commentIdSchema.parse(req.params);
    const { boardType, boardId, content } = req.body;
    const result = await this.commentService.updateComment(
      commentId,
      { boardType, boardId, content },
      req.user,
    );
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
