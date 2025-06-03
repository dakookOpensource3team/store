package com.example.ddd_start.order.domain.value;

import javax.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Receiver {
  private String name;
  private String phoneNumber;
}
