import { EventNames, Listener, OrderCreatedEvent } from '@eztickets/common';
import { queueName } from './queue-name';
import { Ticket } from '../../models/ticket';
import { rabbitMQ } from '../../rabbitmq';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = EventNames.OrderCreated;
  queueName = queueName;

  async onMessage(data: OrderCreatedEvent['data']): Promise<void> {
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
  }
}
