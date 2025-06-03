package com.example.ddd_start.order.domain.value;

import javax.persistence.Enumerated;

public enum OrderState {
  PAYMENT_WAITING(true),
  PREPARING(true),
  SHIPPED(false),
  DELIVERING(false),
  DELIVERY_COMPLETED(false),
  CANCEL(false);

  private Boolean isShippingChangeable;

  OrderState(Boolean isShippingChangeable) {
    this.isShippingChangeable = isShippingChangeable;
  }

  public Boolean getIsShippingInfoChangeable() {
    return isShippingChangeable;
  }
}
