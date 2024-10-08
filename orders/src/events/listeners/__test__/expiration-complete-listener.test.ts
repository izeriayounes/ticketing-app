import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import { ExpirationCompleteEvent } from '@eztickets/common';
import { ExpirationCompletelistener } from '../expiration-complete-listener';
import { rabbitMQ } from '../../../rabbitmq';
import { OrderCancelledPublisher } from '../../publishers/order-cancelled-publisher';
import { ConsumeMessage } from 'amqplib';

const setup = async () => {
  const listener = new ExpirationCompletelistener(rabbitMQ.channel);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 34,
  });
  await ticket.save();

  const order = Order.build({
    userId: 'asdas',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };

  //@ts-ignore
  const msg: ConsumeMessage = {
    content: Buffer.from(JSON.stringify(data)),
  };

  return { data, listener, msg };
};

it('updates the order status to cancelled', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.orderId);

  expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an OrderCancelled event', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(OrderCancelledPublisher.prototype.publish).toHaveBeenCalled();
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(rabbitMQ.channel.ack).toHaveBeenCalledWith(msg);
});
