import { Request, Response } from 'express';
import { AuthRepo } from './auth.repo';
import { AuthService } from './auth.service';
import { adminSignupSchema, signupSchema, superAdminSignupSchema } from './auth.validate';

export class AuthController {
  constructor(private authService: AuthService) {}

  signup = async (req: Request, res: Response) => {
    const input = signupSchema.parse(req.body);
    const result = await this.authService.signup(input);
    return res.status(201).json(result);
  };

  signupAdmin = async (req: Request, res: Response) => {
    const input = adminSignupSchema.parse(req.body);
    const result = await this.authService.signupAdmin(input);
    return res.status(201).json(result);
  };

  signupSuperAdmin = async (req: Request, res: Response) => {
    const input = superAdminSignupSchema.parse(req.body);
    const result = await this.authService.signupSuperAdmin(input);
    return res.status(201).json(result);
  };
}

const authRepo = new AuthRepo();
const authService = new AuthService(authRepo);
export const authController = new AuthController(authService);
