import request from 'supertest';
import app from '../app';

describe('Notice API 테스트', () => {
  describe('GET /api/notices', () => {
    it('인증 없이 공지 목록 조회 시 401을 반환한다', async () => {
      const res = await request(app).get('/api/notices');
      expect(res.status).toEqual(401);
    });
  });

  describe('GET /api/notices/:noticeId', () => {
    it('인증 없이 공지 상세 조회 시 401을 반환한다', async () => {
      const res = await request(app).get('/api/notices/some-id');
      expect(res.status).toEqual(401);
    });
  });
});
