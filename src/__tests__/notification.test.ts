import request from 'supertest';
import app from '../app';

describe('Notification API', () => {
  describe('GET /api/notifications', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/notifications/read-all', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).patch('/api/notifications/read-all');
      expect(res.status).toBe(401);
    });
  });
});
