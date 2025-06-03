package com.example.ddd_start.product.domain;

import com.example.ddd_start.common.domain.Money;
import javax.persistence.Embeddable;
import javax.persistence.Embedded;

@Embeddable
public class Option {

  private String name;
  @Embedded
  private Money price;
}
