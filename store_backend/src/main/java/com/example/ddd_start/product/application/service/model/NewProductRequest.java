package com.example.ddd_start.product.application.service.model;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NewProductRequest {

  private final Long storeId;
  private final String title;
  private final String slug;
  private final Integer price;
  private String description;
  private Long categoryId;
  private List<String> images;

  public NewProductRequest(Long storeId, String title, String slug, Integer price,
      String description, List<String> images) {
    this.storeId = storeId;
    this.title = title;
    this.slug = slug;
    this.price = price;
    this.description = description;
    this.images = images;
  }

  public NewProductRequest(Long storeId, String title, String slug, Integer price,
      String description, Long categoryId, List<String> images) {
    this.storeId = storeId;
    this.title = title;
    this.slug = slug;
    this.price = price;
    this.description = description;
    this.categoryId = categoryId;
    this.images = images;
  }
}
