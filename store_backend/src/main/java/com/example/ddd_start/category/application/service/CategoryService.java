package com.example.ddd_start.category.application.service;

import com.example.ddd_start.category.domain.Category;
import com.example.ddd_start.category.domain.CategoryRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryService {

  private final CategoryRepository categoryRepository;

  public List<Category> findAll() {
    return categoryRepository.findAll();
  }
}
