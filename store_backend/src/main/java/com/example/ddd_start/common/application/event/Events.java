package com.example.ddd_start.common.application.event;

import java.util.List;
import org.springframework.context.ApplicationEventPublisher;

public class Events {

  private static ApplicationEventPublisher eventPublisher;

  public static void setEventPublisher(ApplicationEventPublisher publisher) {
    Events.eventPublisher = publisher;
  }

  public static void raise(Object event) {
    if (eventPublisher != null) {
      eventPublisher.publishEvent(event);
    }
  }

  public static void raiseEvents(List events) {
    events.forEach(eventPublisher::publishEvent);
  }
}
