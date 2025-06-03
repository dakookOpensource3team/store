package com.example.ddd_start.order.application.model;

public record CreateCartCommand(Long memberId, Long productId, Integer quantity) {

}
