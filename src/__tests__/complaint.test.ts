import request from 'supertest';
import app from '../app';

describe('Complaint API 테스트', () => {
  describe('GET /api/complaints', () => {
    it('인증 없이 목록 조회 시 401을 반환한다', async () => {
      const res = await request(app).get('/api/complaints');
      expect(res.status).toEqual(401);
    });
  });

  describe('GET /api/complaints/:complaintId', () => {
    it('인증 없이 상세 조회 시 401을 반환한다', async () => {
      const res = await request(app).get('/api/complaints/some-id');
      expect(res.status).toEqual(401);
    });
  });

  describe('POST /api/complaints', () => {
    it('인증 없이 등록 시 401을 반환한다', async () => {
      const res = await request(app)
        .post('/api/complaints')
        .send({ title: 'test', content: 'test', status: 'PENDING', isPublic: true })
        .set('Content-Type', 'application/json');
      expect(res.status).toEqual(401);
    });
  });
});
