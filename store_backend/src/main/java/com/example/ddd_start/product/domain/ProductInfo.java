package com.example.ddd_start.product.domain;

import java.util.List;
import lombok.Getter;

@Getter
public class ProductInfo {

  private String title;
  private String slug;
  private Integer price;
  private String description;
  private Long categoryId;
  private List<String> images;

  public ProductInfo(String title, String slug, Integer price, String description,
      List<String> images) {
    this.title = title;
    this.slug = slug;
    this.price = price;
    this.description = description;
    this.images = images;
  }

  public ProductInfo(String title, String slug, Integer price, String description, Long categoryId,
      List<String> images) {
    this.title = title;
    this.slug = slug;
    this.price = price;
    this.description = description;
    this.categoryId = categoryId;
    this.images = images;
  }
}
