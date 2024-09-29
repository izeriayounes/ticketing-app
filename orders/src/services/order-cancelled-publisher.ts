import { rabbitMQ, EventNames, OrderCancelledEvent } from '@eztickets/common';

class OrderCancelledPublisher {
  async publish(ticketData: OrderCancelledEvent['data']): Promise<void> {
    const message = JSON.stringify(ticketData);

    await rabbitMQ.sendToQueue(EventNames.OrderCancelled, Buffer.from(message));
    console.log(`Event published: ${EventNames.OrderCancelled}`);
  }
}

export const orderCancelledPublisher = new OrderCancelledPublisher();
