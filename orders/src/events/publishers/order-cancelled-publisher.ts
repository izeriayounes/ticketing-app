import { Publisher, OrderCancelledEvent, EventNames } from '@eztickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = EventNames.OrderCancelled;

  async publish(data: OrderCancelledEvent['data']): Promise<void> {
    const message = JSON.stringify(data);

    this.channel.publish(this.subject, '', Buffer.from(message), {
      headers: {
        'x-delay': 15 * 60 * 1000,
      },
    });

    console.log(`Event published to subject: ${this.subject}`);
  }
}
