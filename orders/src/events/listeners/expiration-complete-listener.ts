import {
  BadRequestError,
  EventNames,
  ExpirationCompleteEvent,
  Listener,
  OrderStatus,
} from '@eztickets/common';
import { expirationCompleteQueue } from './queues';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { rabbitMQ } from '../../rabbitmq';
import { ConsumeMessage } from 'amqplib';

export class ExpirationCompletelistener extends Listener<ExpirationCompleteEvent> {
  readonly subject = EventNames.ExpirationComplete;
  queueName = expirationCompleteQueue;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: ConsumeMessage) {
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) throw new Error('Order not found');

    if (order.status === OrderStatus.Complete)
      throw new BadRequestError('order already paid');

    order.status = OrderStatus.Cancelled;
    await order.save();

    new OrderCancelledPublisher(rabbitMQ.channel).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    rabbitMQ.channel.ack(msg);
  }
}
