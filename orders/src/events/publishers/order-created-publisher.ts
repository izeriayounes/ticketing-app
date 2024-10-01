import { rabbitMQ, EventNames, OrderCreatedEvent } from '@eztickets/common';

class OrderCreatedPublisher {
  async publish(ticketData: OrderCreatedEvent['data']): Promise<void> {
    const message = JSON.stringify(ticketData);

    await rabbitMQ.sendToQueue(EventNames.OrderCreated, Buffer.from(message));
    console.log(`Event published: ${EventNames.OrderCreated}`);
  }
}

export const orderCreatedPublisher = new OrderCreatedPublisher();
