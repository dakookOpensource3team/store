package com.example.ddd_start.order.domain.event;

import java.time.Instant;
import lombok.Getter;

@Getter
public abstract class OrderEvent {

  private Instant timeStamp;

  public OrderEvent() {
    this.timeStamp = Instant.now();
  }
}
