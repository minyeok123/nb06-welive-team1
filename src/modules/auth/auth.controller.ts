import { AuthRepo } from './auth.repo';
import { AuthService } from './auth.service';

export class AuthController {}

const authRepo = new AuthRepo();
const authService = new AuthService(authRepo);
