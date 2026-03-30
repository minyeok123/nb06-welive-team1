import { CustomError } from '@libs/error';
import { AuthRepo } from '@modules/auth/auth.repo';
import { NextFunction, Request, Response } from 'express';
import token from '@modules/auth/utils/token';

const authRepo = new AuthRepo();

export const authenticateRefresh = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new CustomError(401, '잘못된 접근입니다.');
  }

  try {
    // 토큰 검증
    const payload = token.verifyRefreshToken(refreshToken);
    const user = await authRepo.findUserById(payload.id);

    if (!user) {
      throw new CustomError(404, '존재하지 않는 유저입니다.');
    }
    const { password: _, ...withoutPasswordUser } = user;
    req.user = withoutPasswordUser;
    next();
  } catch (error) {
    throw new CustomError(401, '잘못된 접근입니다.');
  }
};
