import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
  AWS_REGION,
} from '@libs/constants';

// S3 클라이언트 초기화
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * S3에 이미지를 업로드합니다 (putImage)
 * @param file Multer를 통해 받은 파일 객체 (memoryStorage 사용)
 * @param key S3에 저장될 파일명(경로 포함, 예: 'profiles/123.jpg')
 * @returns 업로드된 파일의 S3 Key와 퍼블릭 URL을 객체로 반환
 */
export const putImage = async (
  file: Express.Multer.File,
  key: string,
): Promise<{ key: string; url: string }> => {
  const command = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  // 퍼블릭 URL 리턴 (버킷이 퍼블릭일 경우 사용 가능)
  const url = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;

  // DB에 저장하기 편하도록 key와 url을 함께 리턴합니다.
  return { key, url };
};

/**
 * S3에서 이미지를 가져올 수 있는 Presigned URL을 생성합니다 (getImage)
 * @param key S3에 저장된 파일명(경로 포함)
 * @param expiresIn URL 유효 시간 (초 단위, 기본 1시간)
 * @returns 임시 접근이 가능한 Presigned URL 리턴
 */
export const getImage = async (key: string, expiresIn: number = 3600): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: AWS_S3_BUCKET_NAME,
    Key: key,
  });

  // Presigned URL 생성 (프라이빗 버킷 내 파일 접근용)
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return signedUrl;
};
