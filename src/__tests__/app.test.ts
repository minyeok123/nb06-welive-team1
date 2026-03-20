import request from 'supertest';
import app from '../app';

describe('App 테스트', () => {
  it('존재하지 않는 경로는 404를 반환한다', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.status).toEqual(404);
  });

  it('JSON body 파싱이 동작한다', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'wrongpass' })
      .set('Content-Type', 'application/json');
    expect(res.status).not.toEqual(500);
  });
});
