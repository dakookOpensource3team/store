package com.example.ddd_start.order.domain.event;

import com.example.ddd_start.order.domain.value.ShippingInfo;
import java.time.Instant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public class ShippingInfoChangedEvent extends OrderEvent {

  private final Long orderId;
  private final Instant timeStamp;
  private final ShippingInfo shippingInfo;

}
