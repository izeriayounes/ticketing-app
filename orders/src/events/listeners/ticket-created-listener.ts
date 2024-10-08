import { EventNames, Listener, TicketCreatedEvent } from '@eztickets/common';
import { Ticket } from '../../models/ticket';
import { ticketCreatedQueue } from './queues';
import { ConsumeMessage } from 'amqplib';
import { rabbitMQ } from '../../rabbitmq';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  queueName = ticketCreatedQueue;
  readonly subject = EventNames.TicketCreated;

  async onMessage(data: TicketCreatedEvent['data'], msg: ConsumeMessage) {
    const { id, title, price } = data;

    const ticket = Ticket.build({
      id,
      title,
      price,
    });

    await ticket.save();

    rabbitMQ.channel.ack(msg);
  }
}
