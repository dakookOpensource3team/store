package com.example.ddd_start.coupon.Exception;

public class CouponAlreadyUsedException extends RuntimeException {

  public CouponAlreadyUsedException(String message) {
    super(message);
  }
}
