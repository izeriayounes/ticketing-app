import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { OrderCancelledEvent } from '@eztickets/common';
import { orderCancelledListener } from '../order-cancelled-listener';
import { ticketUpdatedPublisher } from '../../publishers/ticket-updated-publisher';

const setup = async () => {
  const orderId = mongoose.Types.ObjectId.toString();

  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: 'asds',
  });

  ticket.orderId = orderId;

  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  //@ts-ignore
  const msg: ConsumeMessage = {
    content: Buffer.from(JSON.stringify(data)),
  };

  return { msg, data, ticket, orderId };
};

it('updates the ticket, publishes an event and acks the message', async () => {
  const { msg, data } = await setup();

  await orderCancelledListener.onMessage(msg);

  const ticket = await Ticket.findById(data.ticket.id);

  expect(ticket!.orderId).toEqual(undefined);

  expect(ticketUpdatedPublisher.publish).toHaveBeenCalled();

  const rabbitMQ = require('@eztickets/common').rabbitMQ;
  expect(rabbitMQ.getChannel().ack).toHaveBeenCalledWith(msg);
});
