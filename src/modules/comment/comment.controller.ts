import { Request, Response } from 'express';
import { CommentRepo } from './comment.repo';
import { CommentService } from './comment.service';
import {
  createCommentSchema,
  updateCommentSchema,
  commentIdSchema,
} from './comment.validate';

export class CommentController {
  constructor(private commentService: CommentService) {}

  createComment = async (req: Request, res: Response) => {
    const input = createCommentSchema.parse(req.body);
    const result = await this.commentService.createComment(input, req.user);
    return res.status(201).json(result);
  };

  updateComment = async (req: Request, res: Response) => {
    const { commentId } = commentIdSchema.parse(req.params);
    const input = updateCommentSchema.parse(req.body);
    const result = await this.commentService.updateComment(commentId, input, req.user);
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
