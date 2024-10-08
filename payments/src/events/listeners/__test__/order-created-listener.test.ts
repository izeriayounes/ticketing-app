import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@eztickets/common';
import { Order } from '../../../models/order';
import { rabbitMQ } from '../../../rabbitmq';
import { OrderCreatedListener } from '../order-created-listener';

const setup = async () => {
  const listener = new OrderCreatedListener(rabbitMQ.channel);

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: 'sadasd',
    expiresAt: 'askldj',
    status: OrderStatus.Created,
    ticket: {
      id: 'as;djk',
      price: 10,
    },
  };

  //@ts-ignore
  const msg: ConsumeMessage = {
    content: Buffer.from(JSON.stringify(data)),
  };

  return { data, listener, msg };
};

it('replicates the order info', async () => {
  const { data, listener, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  const { data, listener, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(rabbitMQ.channel.ack).toHaveBeenCalledWith(msg);
});
