package com.example.ddd_start.coupon.application.model;

import com.example.ddd_start.common.domain.Money;

public record UserCouponDto(Long id, String name, Boolean isUsed, Boolean isRatio, Float ratio,
                            Money fixedAmount) {

}
