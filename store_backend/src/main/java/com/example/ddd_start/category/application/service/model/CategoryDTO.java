package com.example.ddd_start.category.application.service.model;

import com.example.ddd_start.category.domain.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@ToString
@NoArgsConstructor
public class CategoryDTO {

  private Long id;
  private String name;
  private String slug;
  private String image;
  private String creationAt;
  private String updatedAt;

  @Builder
  public CategoryDTO(Long id, String name, String slug, String image, String creationAt,
      String updatedAt) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.image = image;
    this.creationAt = creationAt;
    this.updatedAt = updatedAt;
  }

  public static CategoryDTO createCategoryDTO(Category category) {
    return CategoryDTO.builder()
        .id(category.getId())
        .name(category.getName())
        .slug(category.getSlug())
        .image(category.getImageUrl())
        .creationAt(category.getCreatedAt() != null ? category.getCreatedAt().toString() : null)
        .updatedAt(category.getUpdatedAt() != null ? category.getUpdatedAt().toString() : null)
        .build();
  }
}
