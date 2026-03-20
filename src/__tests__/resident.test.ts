import request from 'supertest';
import app from '../app';

describe('Resident API', () => {
  describe('GET /api/residents', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/residents');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/residents', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/residents')
        .send({ dong: 101, ho: 101, name: 'test', phoneNumber: '01012345678' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(401);
    });
  });
});
