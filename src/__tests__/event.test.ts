import request from 'supertest';
import app from '../app';

describe('Event API', () => {
  describe('GET /api/event', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/event');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/event', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).put('/api/event');
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/event/:eventId', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).delete('/api/event/some-id');
      expect(res.status).toBe(401);
    });
  });
});
