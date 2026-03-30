import { Request, Response, NextFunction } from 'express';
import token from '@modules/auth/utils/token';
import { CustomError } from '@libs/error';
import { AuthRepo } from '@modules/auth/auth.repo';

const authRepo = new AuthRepo();

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    throw new CustomError(401, '작업 권한이 없습니다.');
  }

  try {
    // 토큰 검증
    const payload = token.verifyAccessToken(accessToken);
    const user = await authRepo.findUserById(payload.id);

    if (!user) {
      throw new CustomError(404, '존재하지 않는 유저입니다.');
    }
    const { password: _, ...withoutPasswordUser } = user;
    req.user = withoutPasswordUser;
    next();
  } catch (error) {
    throw new CustomError(401, '작업 권한이 없습니다.');
  }
};
