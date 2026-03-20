import request from 'supertest';
import app from '../app';

describe('Notification API 테스트', () => {
  describe('GET /api/notifications', () => {
    it('인증 없이 알림 목록 조회 시 401을 반환한다', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.status).toEqual(401);
    });
  });

  describe('PATCH /api/notifications/read-all', () => {
    it('인증 없이 전체 읽음 처리 시 401을 반환한다', async () => {
      const res = await request(app).patch('/api/notifications/read-all');
      expect(res.status).toEqual(401);
    });
  });
});
