package com.example.ddd_start.order.presentation.model;

public record AddCartRequest(Long memberId, Long productId, Integer quantity) {

}
