import request from 'supertest';
import app from '../app';

describe('User API 테스트', () => {
  describe('PATCH /api/users/password', () => {
    it('인증 없이 비밀번호 변경 시 401을 반환한다', async () => {
      const res = await request(app)
        .patch('/api/users/password')
        .send({ currentPassword: 'old', newPassword: 'new' })
        .set('Content-Type', 'application/json');
      expect(res.status).toEqual(401);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('인증 없이 프로필 수정 시 401을 반환한다', async () => {
      const res = await request(app).patch('/api/users/me');
      expect(res.status).toEqual(401);
    });
  });
});
