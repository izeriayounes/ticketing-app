import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../../models/order';
import { OrderCancelledEvent } from '@eztickets/common';
import { ConsumeMessage } from 'amqplib';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { rabbitMQ } from '../../../rabbitmq';

const setup = async () => {
  const listener = new OrderCancelledListener(rabbitMQ.channel);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toString(),
    status: OrderStatus.Created,
    userId: 'asdjk',
    version: 0,
    price: 87,
  });

  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: 'asdas',
    },
  };

  //@ts-ignore
  const msg: ConsumeMessage = {
    content: Buffer.from(JSON.stringify(data)),
  };

  return { data, msg, order, listener };
};

it('updates the status of the order', async () => {
  const { data, order, listener, msg } = await setup();

  const orders = await Order.find({});
  console.log(`orders: ${orders}`);

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { data, listener, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(rabbitMQ.channel.ack).toHaveBeenCalledWith(msg);
});
