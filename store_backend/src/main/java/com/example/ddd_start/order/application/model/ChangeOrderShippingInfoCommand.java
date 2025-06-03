package com.example.ddd_start.order.application.model;

import com.example.ddd_start.order.domain.value.ShippingInfo;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChangeOrderShippingInfoCommand {

  private Long orderId;
  private ShippingInfo shippingInfo;
  private boolean useNewShippingAddressAsMemberAddress;

}
