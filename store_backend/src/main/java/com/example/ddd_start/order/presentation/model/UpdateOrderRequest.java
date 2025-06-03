package com.example.ddd_start.order.presentation.model;

import com.example.ddd_start.order.domain.value.ShippingInfo;

public record UpdateOrderRequest(Long orderId, ShippingInfo shippingInfo) {

}
