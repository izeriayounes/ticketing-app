import { EventNames, Listener, OrderCreatedEvent } from '@eztickets/common';
import { orderCreatedQueue } from './queues';
import { Ticket } from '../../models/ticket';
import { rabbitMQ } from '../../rabbitmq';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { ConsumeMessage } from 'amqplib';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = EventNames.OrderCreated;
  queueName = orderCreatedQueue;

  async onMessage(
    data: OrderCreatedEvent['data'],
    msg: ConsumeMessage
  ): Promise<void> {
    const { id, ticket } = data;

    const foundTicket = await Ticket.findById(ticket.id);

    if (!foundTicket) throw new Error('ticket not found');

    foundTicket.orderId = id;

    await foundTicket.save();

    await new TicketUpdatedPublisher(rabbitMQ.channel).publish({
      id: foundTicket.id,
      version: foundTicket.version,
      title: foundTicket.title,
      price: foundTicket.price,
      userId: foundTicket.userId,
      orderId: foundTicket.orderId,
    });

    rabbitMQ.channel.ack(msg);
  }
}
