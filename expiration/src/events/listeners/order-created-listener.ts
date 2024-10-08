import { EventNames, Listener, OrderCreatedEvent } from '@eztickets/common';
import { orderCreatedQueue } from './queues';
import { expirationQueue } from '../../queues/expiration-queue';
import { ConsumeMessage } from 'amqplib';
import { rabbitMQ } from '../../rabbitmq';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  queueName = orderCreatedQueue;
  readonly subject = EventNames.OrderCreated;

  async onMessage(
    data: OrderCreatedEvent['data'],
    msg: ConsumeMessage
  ): Promise<void> {
    const delay =
      new Date(data.expiresAt).getSeconds() - new Date().getSeconds();

    await expirationQueue.add({ orderId: data.id }, { delay: 10000 });

    rabbitMQ.channel.ack(msg);
  }
}
