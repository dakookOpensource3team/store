package com.example.ddd_start.order.domain.service;

import com.example.ddd_start.common.domain.Money;
import com.example.ddd_start.coupon.application.model.UserCouponDto;
import com.example.ddd_start.coupon.domain.UserCoupon;
import com.example.ddd_start.coupon.domain.UserCouponRepository;
import com.example.ddd_start.member.domain.MemberGrade;
import com.example.ddd_start.order.domain.OrderLine;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DiscountCalculationService {

  private final UserCouponRepository userCouponRepository;

  @Transactional
  public Money calculateDiscountAmounts(
      List<OrderLine> orderLines,
      List<UserCouponDto> userCouponDtos,
      MemberGrade grade
  ) {
    List<UserCoupon> userCoupons = userCouponDtos.stream()
        .map(couponDto ->
            userCouponRepository.findById(couponDto.id())
                .orElseThrow(() -> new RuntimeException("Coupon not found")))
        .toList();

    Money discountedAmount = orderLines.stream()
        .map(orderLine -> calculateDiscount(orderLine, userCoupons))
        .reduce(new Money(0), (v1, v2) -> v1.add(v2));
    userCoupons
        .forEach(UserCoupon::useCoupon);

    userCouponRepository.saveAll(userCoupons);

    return discountedAmount;
  }

  private Money calculateDiscount(List<OrderLine> orderLines, UserCoupon userCoupon) {
    return null;
  }

  private Money calculateDiscount(OrderLine orderLine, List<UserCoupon> userCoupons) {
    Money amount = orderLine.getAmount();
    return userCoupons.stream()
        .map(coupon -> coupon.redeemCoupon(amount))
        .reduce(new Money(0), (v1, v2) -> v1.add(v2));
  }

  private Money calculateDiscount(MemberGrade grade) {
    return null;
  }

}
