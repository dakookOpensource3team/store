package com.example.ddd_start.order.application.model;

import com.example.ddd_start.order.domain.value.ShippingInfo;

public record UpdateOrderCommand(Long orderId, ShippingInfo shippingInfo) {

}
