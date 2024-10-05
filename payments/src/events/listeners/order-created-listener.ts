import { Order } from '../../models/order';
import { queueName } from './queue-name';
import { EventNames, Listener, OrderCreatedEvent } from '@eztickets/common';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = EventNames.OrderCreated;
  queueName = queueName;

  async onMessage(data: OrderCreatedEvent['data']): Promise<void> {
    const order = Order.build({
      id: data.id,
      version: data.version,
      price: data.ticket.price,
      userId: data.userId,
      status: data.status,
    });

    await order.save();
  }
}
