import mongoose from 'mongoose';
import { TicketUpdatedEvent } from '@eztickets/common';
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { rabbitMQ } from '../../../rabbitmq';
import { ConsumeMessage } from 'amqplib';

const setup = async () => {
  const listener = new TicketUpdatedListener(rabbitMQ.channel);

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

  return { data, listener, msg };
};

it('finds, updates, and saves a ticket', async () => {
  const { data, listener } = await setup();

  await listener.onMessage(data);

  const foundTicket = await Ticket.findById(data.id);

  expect(foundTicket!.title).toEqual(data.title);
  expect(foundTicket!.price).toEqual(data.price);
  expect(foundTicket!.version).toEqual(data.version);
});

// it('acks the message', async () => {
//   const { data, listener, msg } = await setup();

//   await listener.onMessage(data);

//   expect(rabbitMQ.channel.ack).toHaveBeenCalledWith(msg);
// });

// it('does not aknowledge event if a version is skipped', async () => {
//   const { listener, data } = await setup();

//   data.version = 10;

//   try {
//     await listener.onMessage(data);
//   } catch {}

//   expect(rabbitMQ.channel.ack).not.toHaveBeenCalled();
// });
