package com.example.ddd_start.order.domain.dto;

import com.example.ddd_start.member.domain.Member;
import com.example.ddd_start.order.domain.Order;
import com.example.ddd_start.product.domain.Product;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class OrderResponseDto {
  private Order order;
  private Member member;
  private Product product;

  public OrderResponseDto(Order order, Member member, Product product) {
    this.order = order;
    this.member = member;
    this.product = product;

  }
}
