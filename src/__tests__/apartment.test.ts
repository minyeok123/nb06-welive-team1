import request from 'supertest';
import app from '../app';

describe('Apartment API', () => {
  describe('GET /api/apartments/public', () => {
    it('should return 200 for valid request', async () => {
      const res = await request(app).get('/api/apartments/public');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/apartments/public/:id', () => {
    it('should return 400 for invalid id format', async () => {
      const res = await request(app).get('/api/apartments/public/invalid');
      expect([400, 404]).toContain(res.status);
    });
  });

  describe('GET /api/apartments', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/apartments');
      expect(res.status).toBe(401);
    });
  });
});
