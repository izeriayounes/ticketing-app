import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { OrderCancelledEvent } from '@eztickets/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { TicketUpdatedPublisher } from '../../publishers/ticket-updated-publisher';
import { rabbitMQ } from '../../../rabbitmq';
import { ConsumeMessage } from 'amqplib';

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

  return { data, msg };
};

it('updates the ticket, publishes an event and acks the message', async () => {
  const orderCancelledListener = new OrderCancelledListener(rabbitMQ.channel);

  const { data, msg } = await setup();

  await orderCancelledListener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.ticket.id);

  expect(ticket!.orderId).toEqual(undefined);

  expect(TicketUpdatedPublisher.prototype.publish).toHaveBeenCalled();

  expect(rabbitMQ.channel.ack).toHaveBeenCalledWith(msg);
});
