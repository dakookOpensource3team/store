package com.example.ddd_start.coupon.presentation.model;

public record UpdateCouponDefinitionRequest(
    Long id,
    String name,
    Boolean isRatio,
    Float ratio,
    Integer fixedAmount
) {

}
