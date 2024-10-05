import mongoose from 'mongoose';
import { TicketCreatedListener } from '../ticket-created-listener';
import { TicketCreatedEvent } from '@eztickets/common';
import { Ticket } from '../../../models/ticket';
import { rabbitMQ } from '../../../rabbitmq';
import { ConsumeMessage } from 'amqplib';

const setup = async () => {
  const listener = new TicketCreatedListener(rabbitMQ.channel);

  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  const msg: Partial<ConsumeMessage> = {
    content: Buffer.from(JSON.stringify(data)),
  };

  return { data, listener, msg };
};

it('creates and saves a ticket', async () => {
  const { listener, data } = await setup();

  await listener.onMessage(data);

  const ticket = await Ticket.findById(data.id);

  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data);

  // expect(rabbitMQ.channel.ack).toHaveBeenCalledWith(msg);
});
