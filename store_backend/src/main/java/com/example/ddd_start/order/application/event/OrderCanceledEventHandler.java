package com.example.ddd_start.order.application.event;

import com.example.ddd_start.common.domain.exception.NoOrderException;
import com.example.ddd_start.order.domain.Order;
import com.example.ddd_start.order.domain.OrderLineRepository;
import com.example.ddd_start.order.domain.OrderRepository;
import com.example.ddd_start.order.domain.event.OrderCanceledEvent;
import com.example.ddd_start.order.domain.service.RefundService;
import javax.transaction.Transactional;
import javax.transaction.Transactional.TxType;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class OrderCanceledEventHandler {

  private final RefundService refundService;
  private final OrderRepository orderRepository;
  private final OrderLineRepository orderLineRepository;

  @Async
  @Transactional(value = TxType.REQUIRES_NEW)
  @TransactionalEventListener(
      classes = OrderCanceledEvent.class,
      phase = TransactionPhase.AFTER_COMMIT)
  public void handle(OrderCanceledEvent event) {
    Order order = orderRepository.findById(event.getOrderId()).orElseThrow(NoOrderException::new);
    orderLineRepository.deleteByOrderId(order.getId());

    refundService.refund(event.getPaymentId());
    order.completeRefund();
  }
}
