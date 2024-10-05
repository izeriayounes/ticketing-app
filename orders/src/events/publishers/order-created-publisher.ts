import { EventNames, OrderCreatedEvent, Publisher } from '@eztickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = EventNames.OrderCreated;
}
