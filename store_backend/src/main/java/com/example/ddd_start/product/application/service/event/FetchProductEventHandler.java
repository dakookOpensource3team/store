package com.example.ddd_start.product.application.service.event;

import com.example.ddd_start.product.application.service.FetchProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class FetchProductEventHandler {

  private final FetchProductService fetchProductService;

  @Async
  @EventListener(ApplicationReadyEvent.class)
  public void fetchProduct() {
    fetchProductService.fetchProducts();
  }

  //매일 오후 12시마다 실행
  @Scheduled(cron = "0 0 12 * * *", zone = "Asia/Seoul")
  public void fetchProducts() {
    fetchProductService.fetchProducts();
  }
}
