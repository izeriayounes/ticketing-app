import {
  EventNames,
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
} from '@eztickets/common';
import { queueName } from './queue-name';
import { Order } from '../../models/order';

export class PaymentCreatedListner extends Listener<PaymentCreatedEvent> {
  queueName = queueName;
  readonly subject = EventNames.PaymentCreated;

  async onMessage(data: PaymentCreatedEvent['data']) {
    const order = await Order.findById(data.orderId);
    if (!order) throw new Error('Order not found');

    order.status = OrderStatus.Complete;
    await order.save();
  }
}
