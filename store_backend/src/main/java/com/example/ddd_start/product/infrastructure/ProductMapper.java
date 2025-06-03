package com.example.ddd_start.product.infrastructure;

import com.example.ddd_start.category.application.service.model.CategoryDTO;
import com.example.ddd_start.category.domain.Category;
import com.example.ddd_start.category.domain.CategoryRepository;
import com.example.ddd_start.common.domain.Money;
import com.example.ddd_start.product.application.service.model.ProductDTO;
import com.example.ddd_start.product.domain.Product;
import com.example.ddd_start.product.domain.ProductRepository;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductMapper {

  public static Product toEntity(ProductDTO productDTO) {
    return new Product(
        productDTO.getTitle(),
        productDTO.getSlug(),
        new Money(productDTO.getPrice()),
        productDTO.getDescription(),
        productDTO.getCategory().getId(),
        productDTO.getImages(),
        Instant.parse(productDTO.getCreationAt()),
        Instant.parse(productDTO.getUpdatedAt())
    );
  }

  public static ProductDTO toDto(Product product, Category category) {
    return ProductDTO.builder()
        .id(product.getId())
        .title(product.getTitle())
        .slug(product.getSlug())
        .price(product.getPrice().getAmount())
        .description(product.getDescription())
        .category(CategoryDTO.createCategoryDTO(category))
        .images(product.getImages())
        .creationAt(product.getCreatedAt().toString())
        .updatedAt(product.getUpdatedAt().toString())
        .build();
  }
}
