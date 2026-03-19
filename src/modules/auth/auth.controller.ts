import { NextFunction, Request, Response } from 'express';
import { AuthRepo } from './auth.repo';
import { AuthService } from './auth.service';
import { setTokensCookies } from '../../libs/cookies';
import { loginDto } from './dto/Response.dto';
import { clearCookies } from '../../libs/cookies';
import {
  adminIdSchema,
  adminSignupSchema,
  residentIdSchema,
  signupSchema,
  superAdminSignupSchema,
  updateRegisterStatusSchema,
} from './auth.validate';

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
    const { accessToken, refreshToken: newRefreshToken } = await this.authService.refresh(req.user);
    setTokensCookies(res, accessToken, newRefreshToken);
    res.status(200).json({ message: '작업이 성공적으로 완료되었습니다' });
  };

  updateAdminStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { adminId } = adminIdSchema.parse(req.params);
    const { status } = updateRegisterStatusSchema.parse(req.body);
    await this.authService.updateAdminStatus(adminId, status);
    return res.status(200).json({ message: '작업이 성공적으로 완료되었습니다' });
  };

  updateResidentStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { residentId } = residentIdSchema.parse(req.params);
    const { status } = updateRegisterStatusSchema.parse(req.body);
    await this.authService.updateResidentStatus(residentId, status, req.user);
    return res.status(200).json({ message: '작업이 성공적으로 완료되었습니다' });
  };

  // updateAdminsStatusBatch = async (req: Request, res: Response, next: NextFunction) => {
  //   const { ids, status } = req.body;
  //   await this.authService.updateAdminsStatusBatch(ids, status);
  //   return res.status(200).json({ message: '관리자 가입 상태 일괄 변경이 완료되었습니다' });
  // };

  // updateResidentsStatusBatch = async (req: Request, res: Response, next: NextFunction) => {
  //   const { ids, status } = req.body;
  //   await this.authService.updateResidentsStatusBatch(ids, status);
  //   return res.status(200).json({ message: '주민 가입 상태 일괄 변경이 완료되었습니다' });
  // };

  updateAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.params.adminId as string;
    const {
      contact: phoneNumber,
      name,
      email,
      description,
      apartmentName: aptName,
      apartmentAddress: aptAddress,
      apartmentManagementNumber: officeNumber,
    } = req.body;
    await this.authService.updateAdmin(
      adminId,
      { phoneNumber, name, email },
      {
        description,
        aptName,
        aptAddress,
        officeNumber,
      },
    );
    return res.status(200).json({ message: '작업이 성공적으로 완료되었습니다' });
  };

  deleteApartment = async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.params.adminId as string;
    await this.authService.deleteApartment(adminId);
    return res.status(200).json({ message: '작업이 성공적으로 완료되었습니다' });
  };
  cleanup = async (req: Request, res: Response, next: NextFunction) => {
    await this.authService.cleanup(req.user);
    return res.status(200).json({ message: '작업이 성공적으로 완료되었습니다' });
  };
}

const authRepo = new AuthRepo();
const authService = new AuthService(authRepo);
export const authController = new AuthController(authService);
