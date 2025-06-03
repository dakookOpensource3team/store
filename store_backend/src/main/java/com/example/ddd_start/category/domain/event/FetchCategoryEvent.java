package com.example.ddd_start.category.domain.event;

import com.example.ddd_start.category.application.service.model.CategoryDTO;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class FetchCategoryEvent extends CategoryEvent {

  private final CategoryDTO categoryDTO;

}
