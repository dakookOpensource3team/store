package com.example.ddd_start.product.application.service.model;

import org.springframework.data.domain.Pageable;

public record SearchProductCommand(String title, Pageable pageable) {

}
