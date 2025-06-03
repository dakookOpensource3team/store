package com.example.ddd_start.category.domain.event;

import java.time.Instant;
import lombok.Getter;

@Getter
public abstract class CategoryEvent {

  private final Instant timeStamp;

  public CategoryEvent() {
    this.timeStamp = Instant.now();
  }
}
