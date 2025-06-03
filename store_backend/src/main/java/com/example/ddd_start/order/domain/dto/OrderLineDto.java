package com.example.ddd_start.order.domain.dto;

public record OrderLineDto(Long productId, Integer price, Integer quantity) {

}
