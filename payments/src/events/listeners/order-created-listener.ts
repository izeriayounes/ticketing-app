import { ConsumeMessage } from 'amqplib';
import { Order } from '../../models/order';
import { orderCreatedQueue } from './queues';
import { EventNames, Listener, OrderCreatedEvent } from '@eztickets/common';
import { rabbitMQ } from '../../rabbitmq';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = EventNames.OrderCreated;
  queueName = orderCreatedQueue;

  async onMessage(data: OrderCreatedEvent['data'], msg: ConsumeMessage) {
    const order = Order.build({
      id: data.id,
      version: data.version,
      price: data.ticket.price,
      userId: data.userId,
      status: data.status,
    });

    await order.save();

    rabbitMQ.channel.ack(msg);
  }
}
