import { NextFunction, Request, Response } from 'express';
import { AuthRepo } from './auth.repo';
import { AuthService } from './auth.service';
import { setTokensCookies } from './utils/cookies';
import { loginDto } from './dto/loginResponse.dto';
import { clearCookies } from './utils/cookies';
import { adminSignupSchema, signupSchema, superAdminSignupSchema } from './auth.validate';

export class AuthController {
  constructor(private authService: AuthService) {}

  signup = async (req: Request, res: Response, next: NextFunction) => {
    const input = signupSchema.parse(req.body);
    const result = await this.authService.signup(input);
    return res.status(201).json(result);
  };

  signupAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const input = adminSignupSchema.parse(req.body);
    const result = await this.authService.signupAdmin(input);
    return res.status(201).json(result);
  };

  signupSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const input = superAdminSignupSchema.parse(req.body);
    const result = await this.authService.signupSuperAdmin(input);
    return res.status(201).json(result);
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    const { accessToken, refreshToken, withoutPassword } = await this.authService.login(
      username,
      password,
    );
    setTokensCookies(res, accessToken, refreshToken);
    res.status(200).json(loginDto(withoutPassword));
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    clearCookies(res);
    res.status(204).json({ message: '로그아웃 성공' });
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const { accessToken, refreshToken: newRefreshToken } = await this.authService.refresh(userId);
    setTokensCookies(res, accessToken, newRefreshToken);
    res.status(200).json({ message: '작업이 성공적으로 완료되었습니다' });
  };

  updateAdminStatus = async (req: Request, res: Response, next: NextFunction) => {
    const adminRegisterId = req.params.adminId;
    if (typeof adminRegisterId !== 'string') {
      return res.status(400).json({ message: '잘못된 관리자 ID 형식입니다' });
    }
    const { status } = req.body;
    await this.authService.updateAdminStatus(adminRegisterId, status);
    return res.status(200).json({ message: '작업이 성공적으로 완료되었습니다' });
  };

  updateResidentStatus = async (req: Request, res: Response, next: NextFunction) => {
    const residentRegisterId = req.params.residentId;
    if (typeof residentRegisterId !== 'string') {
      return res.status(400).json({ message: '잘못된 사용자 ID 형식입니다' });
    }
    const { status } = req.body;
    await this.authService.updateResidentStatus(residentRegisterId, status);
    return res.status(200).json({ message: '작업이 성공적으로 완료되었습니다' });
  };

  updateAdminsStatusBatch = async (req: Request, res: Response, next: NextFunction) => {
    const { ids, status } = req.body;
    await this.authService.updateAdminsStatusBatch(ids, status);
    return res.status(200).json({ message: '관리자 가입 상태 일괄 변경이 완료되었습니다' });
  };

  updateResidentsStatusBatch = async (req: Request, res: Response, next: NextFunction) => {
    const { ids, status } = req.body;
    await this.authService.updateResidentsStatusBatch(ids, status);
    return res.status(200).json({ message: '주민 가입 상태 일괄 변경이 완료되었습니다' });
  };
}

const authRepo = new AuthRepo();
const authService = new AuthService(authRepo);
export const authController = new AuthController(authService);
