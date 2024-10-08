import {
  EventNames,
  ExpirationCompleteEvent,
  Publisher,
} from '@eztickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = EventNames.ExpirationComplete;
}
