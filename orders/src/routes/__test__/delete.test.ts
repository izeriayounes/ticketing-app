import request from 'supertest';
import { Ticket } from '../../models/ticket';
import { app } from '../../app';
import { OrderStatus } from '@eztickets/common';
import { Order } from '../../models/order';
import { orderCancelledPublisher } from '../../events/publishers/order-cancelled-publisher';
import mongoose from 'mongoose';

it('cancels the order', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 120,
  });
  await ticket.save();

  const user = global.signin();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(204);

  const cancelledOrder = await Order.findById(order.id);
  expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an orderCancelled event', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 120,
  });
  await ticket.save();

  const user = global.signin();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(204);

  expect(orderCancelledPublisher.publish).toHaveBeenCalled();
});
