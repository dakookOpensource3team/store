package com.example.ddd_start.coupon.domain;

import com.example.ddd_start.common.domain.Money;
import com.example.ddd_start.coupon.Exception.CouponAlreadyUsedException;
import com.example.ddd_start.member.domain.Member;
import java.time.Instant;
import java.time.ZoneId;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@Getter
public class UserCoupon {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String name;
  private Boolean isUsed;
  private Boolean isRatio;
  private Float ratio;
  @ManyToOne
  Member member;
  @Embedded
  private Money fixedAmount;
  private Instant createdAt;
  private Instant updatedAt;
  private Instant usedAt;
  private Instant expiredAt;

  public UserCoupon(String name, Boolean isUsed, Boolean isRatio, Float ratio, Member member,
      Money fixedAmount) {
    this.name = name;
    this.isUsed = isUsed;
    this.isRatio = isRatio;
    this.ratio = ratio;
    this.member = member;
    this.fixedAmount = fixedAmount;
    this.createdAt = Instant.now();
    this.updatedAt = Instant.now();
    this.expiredAt = Instant.now()
        .atZone(ZoneId.systemDefault())
        .plusMonths(3)
        .toInstant();
  }

  public UserCoupon(Member member, CouponDefinition couponDefinition) {
    this.name = couponDefinition.getName();
    this.isUsed = false;
    this.isRatio = couponDefinition.getIsRatio();
    this.ratio = couponDefinition.getRatio();
    this.fixedAmount = couponDefinition.getFixedAmount();
    this.member = member;
    this.createdAt = Instant.now();
    this.updatedAt = Instant.now();
    this.expiredAt = Instant.now()
        .atZone(ZoneId.systemDefault())
        .plusMonths(3)
        .toInstant();
  }

  public Money redeemCoupon(Money money) {
    if (this.isUsed) {
      throw new CouponAlreadyUsedException("Coupon is used");
    }

    if (isRatio) {
      return money.multiply(ratio);
    }
    return money.subtract(fixedAmount);
  }

  public void useCoupon() {
    usedAt = Instant.now();
    isUsed = true;
  }

  public void update(String name, Boolean used, Boolean isRatio, Float ratio, Money fixedAmount) {
    this.name = name;
    this.isUsed = used;
    this.isRatio = isRatio;
    this.ratio = ratio;
    this.fixedAmount = fixedAmount;
    this.updatedAt = Instant.now();
  }
}
