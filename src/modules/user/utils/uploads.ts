import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// 업로드 폴더 경로 (루트의 uploads/profiles 디렉토리)
const uploadDir = 'uploads/profiles';

// 애플리케이션 시작 시 폴더가 없으면 자동 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 환경 변수에 따라 스토리지 분기 처리
const isProduction = process.env.NODE_ENV === 'production';

// Multer 저장소 설정
const storage = isProduction
  ? multer.memoryStorage() // 프로덕션: 메모리에 버퍼로 저장 후 S3로 전송
  : multer.diskStorage({
      destination: (_req, file, cb) => {
        // 파일이 물리적으로 저장될 경로 (상대경로로 지정)
        cb(null, uploadDir);
      },
      filename: (_req, file, cb) => {
        // 파일 이름 충돌 방지를 위한 고유한 파일명 생성
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `profile-${uniqueSuffix}${ext}`);
      },
    });

// 파일 필터링: 이미지 파일만 허용
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('이미지 파일(jpeg, png, jpg, webp)만 업로드 가능합니다.'));
  }
};

// 프로필 이미지 전용 업로드 미들웨어
export const uploadProfile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 용량 제한
});
