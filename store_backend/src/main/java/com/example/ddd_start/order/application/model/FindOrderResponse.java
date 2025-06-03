package com.example.ddd_start.order.application.model;

import com.example.ddd_start.common.domain.Money;
import com.example.ddd_start.order.domain.OrderLine;
import com.example.ddd_start.order.domain.value.OrderState;
import com.example.ddd_start.order.domain.value.PaymentInfo;
import com.example.ddd_start.order.domain.value.ShippingInfo;
import java.time.Instant;
import java.util.List;

public record FindOrderResponse(
    Long orderId,
    OrderState orderState,
    ShippingInfo shippingInfo,
    String message,
    Money totalAmounts,
    String orderer,
    Instant createdAt,
    PaymentInfo paymentInfo,
    List<OrderLine> orderLines) {

}
