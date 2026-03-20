import request from 'supertest';
import app from '../app';

describe('Apartment API 테스트', () => {
  describe('GET /api/apartments/public', () => {
    it('공개 아파트 목록 조회 시 200을 반환한다', async () => {
      const res = await request(app).get('/api/apartments/public');
      expect(res.status).toEqual(200);
    });
  });

  describe('GET /api/apartments/public/:id', () => {
    it('잘못된 id 형식은 400 또는 404를 반환한다', async () => {
      const res = await request(app).get('/api/apartments/public/invalid');
      expect([400, 404]).toContain(res.status);
    });
  });

  describe('GET /api/apartments', () => {
    it('인증 없이 조회 시 401을 반환한다', async () => {
      const res = await request(app).get('/api/apartments');
      expect(res.status).toEqual(401);
    });
  });
});
