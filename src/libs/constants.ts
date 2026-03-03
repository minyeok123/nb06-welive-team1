import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const JWT_ACCESS_SECRET = process.env.JWT_SECRET || 'your-access-secret-key';
export const JWT_REFRESH_SECRET = process.env.JWT_SECRET || 'your-refresh-secret-key';
