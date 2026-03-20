import request from 'supertest';
import app from '../app';

describe('User API', () => {
  describe('PATCH /api/users/password', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .patch('/api/users/password')
        .send({ currentPassword: 'old', newPassword: 'new' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).patch('/api/users/me');
      expect(res.status).toBe(401);
    });
  });
});
