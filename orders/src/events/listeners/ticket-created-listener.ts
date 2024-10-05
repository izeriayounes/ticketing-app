import { EventNames, Listener, TicketCreatedEvent } from '@eztickets/common';
import { Ticket } from '../../models/ticket';
import { queueName } from './queue-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  queueName = queueName;
  readonly subject = EventNames.TicketCreated;

  async onMessage(data: TicketCreatedEvent['data']): Promise<void> {
    const { id, title, price } = data;

    const ticket = Ticket.build({
      id,
      title,
      price,
    });

    await ticket.save();
  }
}
