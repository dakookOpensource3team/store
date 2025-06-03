package com.example.ddd_start.product.presentation.model;

public record SearchProductRequest(String title,
                                   Integer page,
                                   Integer size) {

}
