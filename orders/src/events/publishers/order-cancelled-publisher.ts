import { EventNames, OrderCancelledEvent, Publisher } from '@eztickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = EventNames.OrderCancelled;
}
