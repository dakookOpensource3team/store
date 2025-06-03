package com.example.ddd_start.order.application.service;

import com.example.ddd_start.common.application.event.Events;
import com.example.ddd_start.common.domain.exception.NoOrderException;
import com.example.ddd_start.order.domain.Order;
import com.example.ddd_start.order.domain.OrderRepository;
import com.example.ddd_start.order.domain.service.RefundService;
import javax.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class CancelOrderService {

  private RefundService refundService;
  private OrderRepository orderRepository;

  @Transactional
  public void cancel(Long orderId) {
    Order order = orderRepository.findById(orderId).orElseThrow(NoOrderException::new);
    order.cancel();

    Events.raiseEvents(order.getOrderEvents());
  }

}
