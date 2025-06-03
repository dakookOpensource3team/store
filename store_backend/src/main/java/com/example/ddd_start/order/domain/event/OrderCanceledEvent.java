package com.example.ddd_start.order.domain.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class OrderCanceledEvent extends OrderEvent{

  private final Long orderId;
  private final Long paymentId;
}
