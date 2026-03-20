import request from 'supertest';
import app from '../app';

describe('Comment API', () => {
  describe('POST /api/comments', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/comments')
        .send({
          content: 'test',
          boardType: 'NOTICE',
          boardId: '00000000-0000-0000-0000-000000000000',
        })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/comments/:commentId', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .patch('/api/comments/some-id')
        .send({ content: 'updated' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/comments/:commentId', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).delete('/api/comments/some-id');
      expect(res.status).toBe(401);
    });
  });
});
