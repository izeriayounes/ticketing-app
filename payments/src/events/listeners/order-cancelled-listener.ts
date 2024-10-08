import {
  EventNames,
  Listener,
  OrderCancelledEvent,
  OrderStatus,
} from '@eztickets/common';
import { Order } from '../../models/order';
import { orderCancelledQueue } from './queues';
import { ConsumeMessage } from 'amqplib';
import { rabbitMQ } from '../../rabbitmq';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = EventNames.OrderCancelled;
  queueName = orderCancelledQueue;

  async onMessage(data: OrderCancelledEvent['data'], msg: ConsumeMessage) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    rabbitMQ.channel.ack(msg);
  }
}
