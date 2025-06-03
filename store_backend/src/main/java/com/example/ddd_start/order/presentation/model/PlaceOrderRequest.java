package com.example.ddd_start.order.presentation.model;

import com.example.ddd_start.coupon.application.model.UserCouponDto;
import com.example.ddd_start.order.domain.dto.OrderLineDto;
import com.example.ddd_start.order.domain.value.Orderer;
import com.example.ddd_start.order.domain.value.PaymentInfo;
import com.example.ddd_start.order.domain.value.ShippingInfo;
import java.util.List;

public record PlaceOrderRequest(List<OrderLineDto> orderLines,
                                ShippingInfo shippingInfo,
                                String message,
                                Orderer orderer,
                                PaymentInfo paymentInfo,
                                List<UserCouponDto> coupons) {

}
