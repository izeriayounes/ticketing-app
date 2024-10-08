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

  //@ts-ignore
  const msg: ConsumeMessage = {
    content: Buffer.from(JSON.stringify(data)),
  };

  return { data, listener, msg };
};

it('creates and saves a ticket', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.id);

  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(rabbitMQ.channel.ack).toHaveBeenCalledWith(msg);
});
