package com.example.ddd_start.product.presentation.model;

import java.util.List;


public record UpdateProductCommand(
    Long productId,
    String productName,
    String title,
    String slug,
    Integer price,
    String description,
    Long categoryId,
    List<String> images,
    String creationAt,
    String updatedAt) {


}
