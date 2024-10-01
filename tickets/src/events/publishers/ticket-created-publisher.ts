import { rabbitMQ, EventNames, TicketCreatedEvent } from '@eztickets/common';

class TicketCreatedPublisher {
  async publish(ticketData: TicketCreatedEvent['data']): Promise<void> {
    const message = JSON.stringify(ticketData);

    await rabbitMQ.sendToQueue(EventNames.TicketCreated, Buffer.from(message));
    console.log(`Event published: ${EventNames.TicketCreated}`);
  }
}

export const ticketCreatedPublisher = new TicketCreatedPublisher();
