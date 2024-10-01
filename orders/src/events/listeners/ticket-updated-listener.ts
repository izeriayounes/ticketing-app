import { EventNames, rabbitMQ } from '@eztickets/common';
import { ConsumeMessage } from 'amqplib';
import { Ticket } from '../../models/ticket';

class TicketUpdatedListener {
  private queue = EventNames.TicketUpdated;

  async listen(): Promise<void> {
    await rabbitMQ.consume(this.queue, this.onMessage.bind(this));
  }

  async onMessage(msg: ConsumeMessage | null): Promise<void> {
    if (msg) {
      console.log(`Received event: ${this.queue}`);

      const { id, title, price, version } = JSON.parse(msg.content.toString());

      const ticket = await Ticket.findByEvent({ id, version });

      if (!ticket) throw Error('Ticket not found');

      ticket.set({ title, price });
      await ticket.save();

      rabbitMQ.getChannel().ack(msg);
    }
  }
}

export const ticketUpdatedListener = new TicketUpdatedListener();
