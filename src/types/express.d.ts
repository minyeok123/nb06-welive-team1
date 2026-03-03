import { withoutPasswordUser } from './user.types';

declare global {
  namespace Express {
    interface Request {
      userId: string;
      user: withoutPasswordUser;
      validatedQuery?: string | number | unknown;
    }
  }
}
