import { NextFunction, Request, Response } from 'express';
import { CustomError } from '@libs/error';

export const superAdminAuthorize = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    throw new CustomError(403, '권한이 없습니다');
  }
  next();
};

export const adminAuthorize = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.role !== 'ADMIN') {
    throw new CustomError(403, '권한이 없습니다');
  }
  next();
};

export const isNotUser = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.role === 'USER') {
    throw new CustomError(403, '권한이 없습니다');
  }
  next();
};
