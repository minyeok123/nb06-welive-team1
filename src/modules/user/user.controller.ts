import { NextFunction, Request, Response } from 'express';
import { UserService } from './user.service';
import { UserRepo } from './user.repo';
import { clearCookies } from '../../libs/cookies';

export class UserController {
  constructor(private userService: UserService) {}

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const updatedUser = await this.userService.changePassword(userId, currentPassword, newPassword);
    clearCookies(res);
    res
      .status(200)
      .json({ message: `${updatedUser.name}님의 비밀번호가 변경되었습니다. 다시 로그인해주세요.` });
  };
}

const userRepo = new UserRepo();
const userService = new UserService(userRepo);
export const userController = new UserController(userService);
