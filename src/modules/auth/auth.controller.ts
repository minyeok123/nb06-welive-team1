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
}

const authRepo = new AuthRepo();
const authService = new AuthService(authRepo);
export const authController = new AuthController(authService);
