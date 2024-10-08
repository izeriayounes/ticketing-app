import { EventNames, Listener, OrderCancelledEvent } from '@eztickets/common';
import { orderCancelledQueue } from './queues';
import { Ticket } from '../../models/ticket';
import { rabbitMQ } from '../../rabbitmq';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { ConsumeMessage } from 'amqplib';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = EventNames.OrderCancelled;
  queueName = orderCancelledQueue;

  async onMessage(
    data: OrderCancelledEvent['data'],
    msg: ConsumeMessage
  ): Promise<void> {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) throw new Error('ticket not found');

    ticket.orderId = undefined;

    await ticket.save();

    await new TicketUpdatedPublisher(rabbitMQ.channel).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    rabbitMQ.channel.ack(msg);
  }
}
