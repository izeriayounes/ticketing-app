import { EventNames, Listener, TicketUpdatedEvent } from '@eztickets/common';
import { Ticket } from '../../models/ticket';
import { queueName } from './queue-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  queueName = queueName;
  readonly subject = EventNames.TicketUpdated;

  async onMessage(data: TicketUpdatedEvent['data']): Promise<void> {
    const { id, title, price, version } = data;

    const ticket = await Ticket.findByEvent({ id, version });

    if (!ticket) throw Error('Ticket not found');

    ticket.set({ title, price });

    await ticket.save();
  }
}
