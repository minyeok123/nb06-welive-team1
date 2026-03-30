import { UserRepo } from '@modules/user/user.repo';
import { CustomError } from '@libs/error';
import bcrypt from 'bcrypt';
import { putImage } from '@modules/user/utils/s3.handler';
import path from 'path';

export class UserService {
  constructor(private userRepo: UserRepo) {}

  changePassword = async (
    userId: string,
    data: { currentPassword: string; newPassword: string },
  ) => {
    const user = await this.userRepo.findUserById(userId);
    if (!user) {
      throw new CustomError(404, '존재하지 않은 유저입니다');
    }
    if (data.currentPassword === data.newPassword) {
      throw new CustomError(400, '기존 비밀번호와 동일한 비밀번호를 입력할 수 없습니다.');
    }

    const verifyPassword = await bcrypt.compare(data.currentPassword, user.password);
    if (!verifyPassword) {
      throw new CustomError(401, '비밀번호가 일치하지 않습니다');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);
    const updatedUser = await this.userRepo.updateUserPassword(userId, hashedPassword);
    return updatedUser;
  };

  updateProfile = async (
    userId: string,
    file?: Express.Multer.File,
    input?: { currentPassword?: string; newPassword?: string },
  ) => {
    const user = await this.userRepo.findUserById(userId);
    if (!user) {
      throw new CustomError(404, '존재하지 않은 유저입니다');
    }

    const data: { password?: string; profileImg?: string } = {};

    const isProduction = process.env.NODE_ENV === 'production';
    if (file) {
      if (isProduction && file.buffer) {
        // 프로덕션: S3로 파일 전송 (multer.memoryStorage)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const key = `profiles/profile-${uniqueSuffix}${ext}`;

        const s3Result = await putImage(file, key);

        data.profileImg = s3Result.key; // S3 Key 값을 DB에 저장
      } else {
        // 개발 환경: 로컬 폴더에 저장된 파일 이름 사용 (multer.diskStorage)
        data.profileImg = `/uploads/profiles/${file.filename}`;
      }
    }

    //  input 객체 내부에 값이 하나라도 존재하는지 확인
    const hasPasswordInput = Object.values(input || {}).some((val) => val !== undefined);

    if (hasPasswordInput && input?.currentPassword && input?.newPassword) {
      if (input.currentPassword === input.newPassword) {
        throw new CustomError(400, '기존 비밀번호와 동일한 비밀번호를 입력할 수 없습니다.');
      }
      const verifyPassword = await bcrypt.compare(input.currentPassword, user.password);
      if (!verifyPassword) {
        throw new CustomError(401, '기존 비밀번호와 일치하지 않습니다');
      }

      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(input.newPassword, salt);
    }

    const updatedUser = await this.userRepo.updateUserProfile(userId, data);
    return updatedUser;
  };
}
