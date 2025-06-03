package com.example.ddd_start.category.application.event;

import com.example.ddd_start.category.application.service.model.CategoryDTO;
import com.example.ddd_start.category.domain.Category;
import com.example.ddd_start.category.domain.CategoryRepository;
import com.example.ddd_start.category.domain.event.FetchCategoryEvent;
import com.example.ddd_start.product.application.service.FetchProductService;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class FetchCategoryEventHandler {

  private final CategoryRepository categoryRepository;

  @Async
  @EventListener(FetchCategoryEvent.class)
  @Transactional
  public void fetchCategory(FetchCategoryEvent event) {
    CategoryDTO categoryDTO = event.getCategoryDTO();
    if (categoryRepository.findById(categoryDTO.getId()).isEmpty()) {
      categoryRepository.save(
          new Category(
              categoryDTO.getId(),
              categoryDTO.getName(),
              categoryDTO.getSlug(),
              categoryDTO.getImage(),
              Instant.parse(categoryDTO.getCreationAt()),
              Instant.parse(categoryDTO.getUpdatedAt())
          )
      );
    }
  }
}
