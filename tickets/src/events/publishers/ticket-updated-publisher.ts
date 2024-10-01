import { rabbitMQ, EventNames, TicketUpdatedEvent } from '@eztickets/common';

class TicketUpdatedPublisher {
  async publish(ticketData: TicketUpdatedEvent['data']): Promise<void> {
    const message = JSON.stringify(ticketData);

    await rabbitMQ.sendToQueue(EventNames.TicketUpdated, Buffer.from(message));
    console.log(`Event published: ${EventNames.TicketUpdated}`);
  }
}

export const ticketUpdatedPublisher = new TicketUpdatedPublisher();
