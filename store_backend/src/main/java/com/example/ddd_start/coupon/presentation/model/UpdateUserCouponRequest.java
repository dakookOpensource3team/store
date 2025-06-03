package com.example.ddd_start.coupon.presentation.model;

import com.example.ddd_start.common.domain.Money;

public record UpdateUserCouponRequest(
    Long id, String name, Boolean isUsed, Boolean isRatio, Float ratio,
    Money fixedAmount
) {

}
