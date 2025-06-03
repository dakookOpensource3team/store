package com.example.ddd_start.order.domain.dto;

import com.example.ddd_start.common.domain.Money;
import com.example.ddd_start.order.domain.value.OrderState;
import com.example.ddd_start.order.domain.value.ShippingInfo;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OrderDto {

  private String orderNumber;
  private OrderState orderState;
  private ShippingInfo shippingInfo;
  private Money totalAmounts;
  private String orderer;
  private Instant createdAt;

}
