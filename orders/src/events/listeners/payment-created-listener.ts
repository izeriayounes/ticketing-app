import {
  EventNames,
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
} from '@eztickets/common';
import { Order } from '../../models/order';
import { paymentCreatedQueue } from './queues';
import { ConsumeMessage } from 'amqplib';
import { rabbitMQ } from '../../rabbitmq';

export class PaymentCreatedListner extends Listener<PaymentCreatedEvent> {
  queueName = paymentCreatedQueue;
  readonly subject = EventNames.PaymentCreated;

  async onMessage(data: PaymentCreatedEvent['data'], msg: ConsumeMessage) {
    const order = await Order.findById(data.orderId);
    if (!order) throw new Error('Order not found');

    order.status = OrderStatus.Complete;
    await order.save();

    rabbitMQ.channel.ack(msg);
  }
}
