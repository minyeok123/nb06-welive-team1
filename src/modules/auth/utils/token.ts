import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from '../../../libs/constants';
import jwt from 'jsonwebtoken';

interface Payload {
  id: number;
}

export const createTokens = (userId: number) => {
  const payload = { id: userId };
  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_ACCESS_SECRET) as Payload;
};

const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as Payload;
};

export default {
  createTokens,
  verifyAccessToken,
  verifyRefreshToken,
};
