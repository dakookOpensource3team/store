package com.example.ddd_start.coupon.application.model;

public record RegisterCouponDefinitionCommand(
    String name, Boolean isRatio, Float ratio, Integer fixedAmount) {

}
