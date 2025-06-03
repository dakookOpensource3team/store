package com.example.ddd_start.order.domain.value;

import com.example.ddd_start.common.domain.Address;
import javax.persistence.Embeddable;
import javax.persistence.Embedded;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Embeddable
@AllArgsConstructor
@NoArgsConstructor
public class ShippingInfo {

  @Embedded
  private Address address;
  @Embedded
  private Receiver receiver;
}
