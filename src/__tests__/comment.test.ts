import request from 'supertest';
import app from '../app';

describe('Comment API 테스트', () => {
  describe('POST /api/comments', () => {
    it('인증 없이 댓글 등록 시 401을 반환한다', async () => {
      const res = await request(app)
        .post('/api/comments')
        .send({
          content: 'test',
          boardType: 'NOTICE',
          boardId: '00000000-0000-0000-0000-000000000000',
        })
        .set('Content-Type', 'application/json');
      expect(res.status).toEqual(401);
    });
  });

  describe('PATCH /api/comments/:commentId', () => {
    it('인증 없이 댓글 수정 시 401을 반환한다', async () => {
      const res = await request(app)
        .patch('/api/comments/some-id')
        .send({ content: 'updated' })
        .set('Content-Type', 'application/json');
      expect(res.status).toEqual(401);
    });
  });

  describe('DELETE /api/comments/:commentId', () => {
    it('인증 없이 댓글 삭제 시 401을 반환한다', async () => {
      const res = await request(app).delete('/api/comments/some-id');
      expect(res.status).toEqual(401);
    });
  });
});
