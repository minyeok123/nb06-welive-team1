import request from 'supertest';
import app from '../app';

describe('Resident API 테스트', () => {
  describe('GET /api/residents', () => {
    it('인증 없이 입주민 목록 조회 시 401을 반환한다', async () => {
      const res = await request(app).get('/api/residents');
      expect(res.status).toEqual(401);
    });
  });

  describe('POST /api/residents', () => {
    it('인증 없이 입주민 등록 시 401을 반환한다', async () => {
      const res = await request(app)
        .post('/api/residents')
        .send({ dong: 101, ho: 101, name: 'test', phoneNumber: '01012345678' })
        .set('Content-Type', 'application/json');
      expect(res.status).toEqual(401);
    });
  });
});
