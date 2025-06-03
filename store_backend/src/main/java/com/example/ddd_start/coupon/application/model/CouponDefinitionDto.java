package com.example.ddd_start.coupon.application.model;

import com.example.ddd_start.common.domain.Money;
import java.time.Instant;

public record CouponDefinitionDto(
    Long id,
    String name,
    Boolean isRatio,
    Float ratio,
    Money fixedAmount,
    Instant createdAt,
    Instant updatedAt,
    Instant expiredAt
) {

}
