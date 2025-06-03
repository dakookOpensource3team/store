package com.example.ddd_start.coupon.presentation.model;

import com.example.ddd_start.coupon.application.model.CouponDefinitionDto;

public record UpdateCouponDefinitionResponse(CouponDefinitionDto update, String message) {

}
