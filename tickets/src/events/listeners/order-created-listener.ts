import { EventNames, rabbitMQ } from '@eztickets/common';
import { ConsumeMessage } from 'amqplib';
import { Ticket } from '../../models/ticket';
import { ticketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

class OrderCreatedListener {
  private queue = EventNames.OrderCreated;

  async listen(): Promise<void> {
    await rabbitMQ.consume(this.queue, this.onMessage.bind(this));
  }

  async onMessage(msg: ConsumeMessage | null): Promise<void> {
    if (msg) {
      console.log(`Received event: ${this.queue}`);

      const { id, ticket } = JSON.parse(msg.content.toString());

      const foundTicket = await Ticket.findById(ticket.id);

      if (!foundTicket) throw new Error('ticket not found');

      foundTicket.set({
        orderId: id,
      });

      await foundTicket.save();

      await ticketUpdatedPublisher.publish({
        id: foundTicket.id,
        version: foundTicket.version,
        title: foundTicket.title,
        price: foundTicket.price,
        userId: foundTicket.userId,
      });

      rabbitMQ.getChannel().ack(msg);
    }
  }
}

export const orderCreatedListener = new OrderCreatedListener();
