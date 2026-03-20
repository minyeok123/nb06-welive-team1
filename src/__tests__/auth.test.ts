import request from 'supertest';
import app from '../app';

describe('Auth API 테스트', () => {
  describe('POST /api/auth/login', () => {
    it('username 누락 시 400을 반환한다', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'test12345678' })
        .set('Content-Type', 'application/json');
      expect(res.status).toEqual(400);
    });

    it('password 누락 시 400을 반환한다', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser' })
        .set('Content-Type', 'application/json');
      expect(res.status).toEqual(400);
    });

    it('존재하지 않는 유저는 에러를 반환한다', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistentuser', password: 'wrongpassword' })
        .set('Content-Type', 'application/json');
      expect([400, 401, 404]).toContain(res.status);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('로그아웃 시 2xx를 반환한다', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(res.status).toBeLessThan(300);
    });
  });
});
