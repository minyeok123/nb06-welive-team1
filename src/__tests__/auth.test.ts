import request from 'supertest';
import app from '../app';

describe('Auth API', () => {
  describe('POST /api/auth/login', () => {
    it('should return 400 for invalid body (missing username)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'test12345678' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid body (missing password)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
    });

    it('should return error for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistentuser', password: 'wrongpassword' })
        .set('Content-Type', 'application/json');
      expect([400, 401, 404]).toContain(res.status);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return 2xx success', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(res.status).toBeLessThan(300);
    });
  });
});
