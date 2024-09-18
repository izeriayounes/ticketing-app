import request from 'supertest';
import { app } from '../../app';

it('sets a cookie after successful signin', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'test',
    })
    .expect(201);
  const res = await request(app)
    .post('/api/users/signout')
    .send({
      email: 'test@test.com',
      password: 'test',
    })
    .expect(200);
  const cookie = res.get('Set-Cookie') ?? [];
  expect(cookie[0]).toEqual(
    'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );
});
