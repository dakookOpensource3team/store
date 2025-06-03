package com.example.ddd_start.order.presentation.model;

import com.example.ddd_start.order.application.model.CartDto;

public record UpdateCartResponse(CartDto update, String message) {

}
