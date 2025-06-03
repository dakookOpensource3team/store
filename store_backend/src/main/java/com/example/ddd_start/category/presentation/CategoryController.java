package com.example.ddd_start.category.presentation;

import com.example.ddd_start.category.application.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class CategoryController {

  private final CategoryService categoryService;

  @GetMapping("/categories")
  public ResponseEntity printAllCategories() {
    return ResponseEntity.ok(categoryService.findAll());
  }
}
