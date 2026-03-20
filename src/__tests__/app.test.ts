import request from 'supertest';
import app from '../app';

describe('App', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.status).toBe(404);
  });

  it('should have JSON body parser', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'wrongpass' })
      .set('Content-Type', 'application/json');
    expect(res.status).not.toBe(500);
  });
});
