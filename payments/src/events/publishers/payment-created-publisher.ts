import { EventNames, PaymentCreatedEvent, Publisher } from '@eztickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = EventNames.PaymentCreated;
}
