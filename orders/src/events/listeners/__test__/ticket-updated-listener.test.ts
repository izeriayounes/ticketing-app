import mongoose from 'mongoose';
import { TicketUpdatedEvent } from '@eztickets/common';
import { ConsumeMessage } from 'amqplib';
import { Ticket } from '../../../models/ticket';
import { ticketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });

  await ticket.save();

  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'modified concert',
    price: 999,
    userId: 'asdjlk',
  };

  //@ts-ignore
  const msg: ConsumeMessage = {
    content: Buffer.from(JSON.stringify(data)),
  };

  return { data, msg };
};

it('finds, updates, and saves a ticket', async () => {
  const { data, msg } = await setup();

  await ticketUpdatedListener.onMessage(msg);

  const foundTicket = await Ticket.findById(data.id);

  expect(foundTicket!.title).toEqual(data.title);
  expect(foundTicket!.price).toEqual(data.price);
  expect(foundTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { msg } = await setup();

  await ticketUpdatedListener.onMessage(msg);

  const rabbitMQ = require('@eztickets/common').rabbitMQ;
  expect(rabbitMQ.getChannel().ack).toHaveBeenCalledWith(msg);
});

it('does not aknowledge event if a version is skipped', async () => {
  const { msg, data } = await setup();

  data.version = 10;

  msg.content = Buffer.from(JSON.stringify(data));

  try {
    await ticketUpdatedListener.onMessage(msg);
  } catch {}

  const rabbitMQ = require('@eztickets/common').rabbitMQ;
  expect(rabbitMQ.getChannel().ack).not.toHaveBeenCalled();
});
