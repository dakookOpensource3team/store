package com.example.ddd_start.order.presentation.model;

import com.example.ddd_start.common.domain.Money;
import com.example.ddd_start.order.domain.value.OrderState;

public class CancelOrderRes {

  private Long orderId;
  private String orderNumber;
  private OrderState orderState;
  private Money total_amount;
}
