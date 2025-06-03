package com.example.ddd_start.order.domain;

import com.example.ddd_start.order.domain.value.OrderState;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OrderSearchCondition {

  private Long ordererId;
  private OrderState orderState;
}
