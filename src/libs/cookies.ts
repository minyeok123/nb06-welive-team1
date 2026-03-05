import { Response, CookieOptions } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

const defaultCookieOptions: CookieOptions = {
  httpOnly: true, // XSS 방어 (JS에서 읽기 불가)
  secure: isProduction, // HTTPS에서만 쿠키 전송
  sameSite: isProduction ? 'strict' : 'lax', // CSRF 방어
  path: '/', // 모든 경로에서 쿠키 유효
};

export const setTokensCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie('accessToken', accessToken, {
    ...defaultCookieOptions,
    maxAge: 1000 * 60 * 60, // 1시간
  });
  res.cookie('refreshToken', refreshToken, {
    ...defaultCookieOptions,
    maxAge: 1000 * 60 * 60 * 24 * 14, // 14일
  });
};

export const clearCookies = (res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};
