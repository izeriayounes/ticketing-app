import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@eztickets/common';
import { Ticket } from '../../../models/ticket';
import { OrderCreatedListener } from '../order-created-listener';
import { TicketUpdatedPublisher } from '../../publishers/ticket-updated-publisher';
import { rabbitMQ } from '../../../rabbitmq';

const setup = async () => {
  const listener = new OrderCreatedListener(rabbitMQ.channel);

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

  return { data, listener, msg };
};

it('sets the orderId of the ticket', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.ticket.id);

  expect(ticket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(rabbitMQ.channel.ack).toHaveBeenCalledWith(msg);
});

it('publishes a ticket updated event', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(TicketUpdatedPublisher.prototype.publish).toHaveBeenCalled();
});
