import { AuthRepo } from './auth.repo';

export class AuthService {
  constructor(private repo: AuthRepo) {}
}
