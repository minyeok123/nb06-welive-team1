import request from 'supertest';
import app from '../app';

describe('Notice API', () => {
  describe('GET /api/notices', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/notices');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/notices/:noticeId', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/notices/some-id');
      expect(res.status).toBe(401);
    });
  });
});
