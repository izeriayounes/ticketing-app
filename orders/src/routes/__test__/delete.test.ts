import request from 'supertest';
import { Ticket } from '../../models/ticket';
import { app } from '../../app';
import { OrderStatus } from '@eztickets/common';
import { Order } from '../../models/order';
import { orderCancelledPublisher } from '../../services/order-cancelled-publisher';

it('cancels the order', async () => {
  const ticket = Ticket.build({
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
  const ticket = Ticket.build({
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
