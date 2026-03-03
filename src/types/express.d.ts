import { withoutPasswordUser } from './user.types';

declare global {
  namespace Express {
    interface Request {
      userId: number;
      user: withoutPasswordUser;
    }
  }
}
