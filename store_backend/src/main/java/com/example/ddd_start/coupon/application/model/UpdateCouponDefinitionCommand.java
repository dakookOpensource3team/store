package com.example.ddd_start.coupon.application.model;

public record UpdateCouponDefinitionCommand(
    Long id, String name, Boolean isRatio, Float ratio, Integer fixedAmount) {

}
