import { EventNames, Listener, TicketUpdatedEvent } from '@eztickets/common';
import { Ticket } from '../../models/ticket';
import { ticketUpdatedQueue } from './queues';
import { ConsumeMessage } from 'amqplib';
import { rabbitMQ } from '../../rabbitmq';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  queueName = ticketUpdatedQueue;
  readonly subject = EventNames.TicketUpdated;

  async onMessage(
    data: TicketUpdatedEvent['data'],
    msg: ConsumeMessage
  ): Promise<void> {
    const { id, title, price, version } = data;

    const ticket = await Ticket.findByEvent({ id, version });

    if (!ticket) throw Error('Ticket not found');

    ticket.set({ title, price });

    await ticket.save();

    rabbitMQ.channel.ack(msg);
  }
}
