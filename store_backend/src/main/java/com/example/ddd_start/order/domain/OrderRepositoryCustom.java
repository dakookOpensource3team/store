package com.example.ddd_start.order.domain;

import com.example.ddd_start.order.domain.dto.OrderDto;
import java.util.List;

public interface OrderRepositoryCustom {

  List<OrderDto> searchMyOrders(OrderSearchCondition orderSearchCondition);

  List<OrderDto> searchMyStateOrders(OrderSearchCondition orderSearchCondition);

  List<OrderDto> search();
}
