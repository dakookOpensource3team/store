package com.example.ddd_start.coupon.presentation.model;

public record RegisterCouponDefinitionRequest(
    String name,
    Boolean isRatio,
    Float ratio,
    Integer fixedAmount) {

}
