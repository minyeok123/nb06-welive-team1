import request from 'supertest';
import app from '../app';

describe('Event API 테스트', () => {
  describe('GET /api/event', () => {
    it('인증 없이 이벤트 목록 조회 시 401을 반환한다', async () => {
      const res = await request(app).get('/api/event');
      expect(res.status).toEqual(401);
    });
  });

  describe('PUT /api/event', () => {
    it('인증 없이 이벤트 수정 시 401을 반환한다', async () => {
      const res = await request(app).put('/api/event');
      expect(res.status).toEqual(401);
    });
  });

  describe('DELETE /api/event/:eventId', () => {
    it('인증 없이 이벤트 삭제 시 401을 반환한다', async () => {
      const res = await request(app).delete('/api/event/some-id');
      expect(res.status).toEqual(401);
    });
  });
});
