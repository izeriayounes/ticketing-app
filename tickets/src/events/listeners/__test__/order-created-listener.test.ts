import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@eztickets/common';
import { ConsumeMessage } from 'amqplib';
import { Ticket } from '../../../models/ticket';
import { orderCreatedListener } from '../order-created-listener';
import { ticketUpdatedPublisher } from '../../publishers/ticket-updated-publisher';

const setup = async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: 'asds',
  });

  await ticket.save();

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: 'sadasd',
    expiresAt: 'askldj',
    status: OrderStatus.Created,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  //@ts-ignore
  const msg: ConsumeMessage = {
    content: Buffer.from(JSON.stringify(data)),
  };

  return { data, msg };
};

it('sets the orderId of the ticket', async () => {
  const { msg, data } = await setup();

  await orderCreatedListener.onMessage(msg);

  const ticket = await Ticket.findById(data.ticket.id);

  expect(ticket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { msg } = await setup();

  await orderCreatedListener.onMessage(msg);

  const rabbitMQ = require('@eztickets/common').rabbitMQ;
  expect(rabbitMQ.getChannel().ack).toHaveBeenCalledWith(msg);
});

it('publishes a ticket updated event', async () => {
  const { msg } = await setup();

  await orderCreatedListener.onMessage(msg);

  expect(ticketUpdatedPublisher.publish).toHaveBeenCalled();
});
