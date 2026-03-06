import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const JWT_ACCESS_SECRET = process.env.JWT_SECRET || 'your-access-secret-key';
export const JWT_REFRESH_SECRET = process.env.JWT_SECRET || 'your-refresh-secret-key';
export const AWS_REGION = process.env.AWS_REGION || 'ap-northeast-2';
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
export const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';
