package com.example.ddd_start.product.application.service.model;

import com.example.ddd_start.category.application.service.model.CategoryDTO;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductDTO {
  private Long id;
  private String title;
  private String slug;
  private Integer price;
  private String description;
  private CategoryDTO category;
  private List<String> images;
  private String creationAt;
  private String updatedAt;
}