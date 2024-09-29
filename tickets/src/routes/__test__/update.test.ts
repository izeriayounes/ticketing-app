import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';
import { ticketUpdatedPublisher } from '../../services/ticket-updated-publisher';

it('returns a 404 error if ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'sdasd',
      price: 23,
    })
    .expect(404);
});

it('returns a 401 if user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'sdasd',
      price: 23,
    })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const ticket = Ticket.build({
    title: 'new title',
    price: 32,
    userId: 'randomid',
  });
  await ticket.save();

  const tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);

  const ticketId = tickets[0].id;

  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set('Cookie', global.signin())
    .send({ title: 'updated title', price: 22 })
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const reponse = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'sdfsf', price: 23 });

  await request(app)
    .put(`/api/tickets/${reponse.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 10,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${reponse.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'asdasd',
      price: -10,
    })
    .expect(400);
});

it('Updates the ticket with provided valid inputs', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'sdfsf', price: 23 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'modified title',
      price: 20,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual('modified title');
  expect(ticketResponse.body.price).toEqual(20);
});

it('publishes an event', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'sdfsf', price: 23 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'modified title',
      price: 20,
    })
    .expect(200);

  expect(ticketUpdatedPublisher.publish).toHaveBeenCalled();
});
