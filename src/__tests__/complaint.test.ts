import request from 'supertest';
import app from '../app';

describe('Complaint API', () => {
  describe('GET /api/complaints', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/complaints');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/complaints/:complaintId', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/complaints/some-id');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/complaints', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/complaints')
        .send({ title: 'test', content: 'test', status: 'PENDING', isPublic: true })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(401);
    });
  });
});
