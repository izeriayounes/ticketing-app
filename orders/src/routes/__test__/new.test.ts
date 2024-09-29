import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { orderCreatedPublisher } from '../../services/order-created-publisher';

it('returns an error if the ticket does not exist ', async () => {
  const ticketId = new mongoose.Types.ObjectId();
  request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(404);
});

it('returns an error if the ticket is already reserved ', async () => {
  const ticket = Ticket.build({ title: 'reverved ticket', price: 34 });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reserves a ticket ', async () => {
  const ticket = Ticket.build({ title: 'reverved ticket', price: 34 });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it('emits an order create event.', async () => {
  const ticket = Ticket.build({ title: 'reverved ticket', price: 34 });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(orderCreatedPublisher.publish).toHaveBeenCalled();
});
