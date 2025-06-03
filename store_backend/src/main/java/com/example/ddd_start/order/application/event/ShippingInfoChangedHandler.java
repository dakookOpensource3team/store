package com.example.ddd_start.order.application.event;

import com.example.ddd_start.order.domain.event.ShippingInfoChangedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ShippingInfoChangedHandler {

  @Async
  @EventListener(ShippingInfoChangedEvent.class)
  public void loggingShippingInfoChanged(ShippingInfoChangedEvent event) {
    log.info("배송정보가 변경되었습니다.");
  }

  @Async
  @EventListener(ShippingInfoChangedEvent.class)
  public void loggingShippingInfoChanged2(ShippingInfoChangedEvent event) {
    log.info("배송정보가 변경되었습니다.2");
  }
}
