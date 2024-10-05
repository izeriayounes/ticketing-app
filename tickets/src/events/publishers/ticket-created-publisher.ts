import { EventNames, Publisher, TicketCreatedEvent } from '@eztickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = EventNames.TicketCreated;
}
