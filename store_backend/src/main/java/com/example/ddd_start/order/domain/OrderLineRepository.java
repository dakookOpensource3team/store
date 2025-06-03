package com.example.ddd_start.order.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderLineRepository extends JpaRepository<OrderLine, Long> {

  public void deleteByOrderId(Long orderId);
  public List<OrderLine> findByOrderId(Long orderId);
}
