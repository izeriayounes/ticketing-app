import mongoose from 'mongoose';
import { ticketCreatedListener } from '../ticket-created-listener';
import { TicketCreatedEvent } from '@eztickets/common';
import { ConsumeMessage } from 'amqplib';
import { Ticket } from '../../../models/ticket';

const setup = () => {
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

  return { data, msg };
};

it('creates and saves a ticket', async () => {
  const { msg, data } = setup();

  await ticketCreatedListener.onMessage(msg);

  const ticket = await Ticket.findById(data.id);

  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  const { msg, data } = setup();

  await ticketCreatedListener.onMessage(msg);

  const rabbitMQ = require('@eztickets/common').rabbitMQ;
  expect(rabbitMQ.getChannel().ack).toHaveBeenCalledWith(msg);
});
