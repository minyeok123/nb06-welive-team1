import multer from 'multer';

export const uploadCsv = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/csv',
      'text/comma-separated-values',
    ];
    if (allowedMimeTypes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('CSV 파일만 업로드할 수 있습니다.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
});
