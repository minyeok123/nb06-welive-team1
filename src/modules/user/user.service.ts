import { UserRepo } from './user.repo';
import { CustomError } from '@libs/error';
import bcrypt from 'bcrypt';

export class UserService {
  constructor(private userRepo: UserRepo) {}

  changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
    const user = await this.userRepo.findUserById(userId);
    if (!user) {
      throw new CustomError(404, '존재하지 않은 유저입니다');
    }

    const verifyPassword = await bcrypt.compare(currentPassword, user.password);
    if (!verifyPassword) {
      throw new CustomError(401, '비밀번호가 일치하지 않습니다');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const updatedUser = await this.userRepo.updateUserPassword(userId, hashedPassword);
    return updatedUser;
  };
}
