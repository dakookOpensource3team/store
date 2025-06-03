package com.example.ddd_start.common.domain;

import javax.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Address {
  private String address;
  private String detailedAddress;
  private Integer zipCode;
}
