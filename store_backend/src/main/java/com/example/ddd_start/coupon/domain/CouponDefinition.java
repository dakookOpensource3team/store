package com.example.ddd_start.coupon.domain;

import com.example.ddd_start.common.domain.Money;
import java.time.Instant;
import java.time.ZoneId;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class CouponDefinition {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String name;
  private Boolean isRatio;
  private Float ratio;
  @Embedded
  private Money fixedAmount;
  private Instant createdAt;
  private Instant updatedAt;
  private Instant expiredAt;

  public CouponDefinition(String name, Boolean isRatio, Float ratio, Money fixedAmount) {
    this.name = name;
    this.isRatio = isRatio;
    this.ratio = ratio;
    this.fixedAmount = fixedAmount;
    this.createdAt = Instant.now();
    this.updatedAt = Instant.now();
    this.expiredAt = Instant.now()
        .atZone(ZoneId.systemDefault())
        .plusMonths(3)
        .toInstant();
  }

  public void update(String name, Boolean isRatio, Float ratio, Money fixedAmount) {
    this.name = name;
    this.isRatio = isRatio;
    this.ratio = ratio;
    this.fixedAmount = fixedAmount;
    this.updatedAt = Instant.now();
    this.expiredAt = Instant.now()
        .atZone(ZoneId.systemDefault())
        .plusMonths(3)
        .toInstant();
  }

}
