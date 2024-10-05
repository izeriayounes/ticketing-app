import {
  EventNames,
  Listener,
  OrderCancelledEvent,
  OrderStatus,
} from '@eztickets/common';
import { Order } from '../../models/order';
import { queueName } from './queue-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = EventNames.OrderCancelled;
  queueName = queueName;

  async onMessage(data: OrderCancelledEvent['data']): Promise<void> {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.status = OrderStatus.Cancelled;
    await order.save();
  }
}
