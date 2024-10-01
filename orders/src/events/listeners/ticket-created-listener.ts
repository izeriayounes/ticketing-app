import { EventNames, rabbitMQ } from '@eztickets/common';
import { ConsumeMessage } from 'amqplib';
import { Ticket } from '../../models/ticket';

class TicketCreatedListener {
  private queue = EventNames.TicketCreated;

  async listen(): Promise<void> {
    await rabbitMQ.consume(this.queue, this.onMessage.bind(this));
  }

  async onMessage(msg: ConsumeMessage | null): Promise<void> {
    if (msg) {
      console.log(`Received event: ${this.queue}`);

      const { id, title, price } = JSON.parse(msg.content.toString());

      const ticket = Ticket.build({
        id,
        title,
        price,
      });

      await ticket.save();

      rabbitMQ.getChannel().ack(msg);
    }
  }
}

export const ticketCreatedListener = new TicketCreatedListener();
