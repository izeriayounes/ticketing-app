import { EventNames, TicketUpdatedEvent, Publisher } from '@eztickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = EventNames.TicketUpdated;
}
