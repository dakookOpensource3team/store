package com.example.ddd_start.product.application.service;

import com.example.ddd_start.category.domain.Category;
import com.example.ddd_start.category.domain.CategoryRepository;
import com.example.ddd_start.product.application.service.model.ProductDTO;
import com.example.ddd_start.product.application.service.model.SearchProductCommand;
import com.example.ddd_start.product.domain.Product;
import com.example.ddd_start.product.domain.ProductRepository;
import com.example.ddd_start.product.infrastructure.ProductMapper;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PrintProductService {

  private final ProductRepository productRepository;
  private final CategoryRepository categoryRepository;

  public List<ProductDTO> printAllProducts(Pageable pageable) {
    List<Product> products = productRepository.findAll(pageable).getContent();
    List<Category> categories = categoryRepository.findAll();
    List<ProductDTO> productDTO = new ArrayList<>();

    for (Product product : products) {
      Category category = categories.stream()
          .filter(it -> Objects.equals(it.getId(), product.getCategoryId()))
          .findFirst()
          .orElse(new Category());

      ProductDTO productDto = ProductMapper.toDto(product, category);
      productDTO.add(productDto);
    }
    return productDTO;
  }

  public ProductDTO printProductById(Long productId) {
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new NoSuchElementException("Product not found"));
    Category category = categoryRepository.findById(product.getCategoryId())
        .orElse(new Category());

    return ProductMapper.toDto(product, category);
  }

  public Page<Product> searchProducts(SearchProductCommand cmd) {
    return productRepository
        .findPageProductByTitleContaining(
            cmd.title(),
            cmd.pageable()
        );
  }

  public Page<Product> printAllProductsOrderByLowPrice(Pageable pageable) {
    return productRepository.findAll(pageable);
  }

  public Page<Product> printAllProductsOrderByHighPrice(Pageable pageable) {
    return productRepository.findAll(pageable);
  }

  public List<ProductDTO> printProductByCategoryId(Long categoryId, Pageable pageable) {
    List<Product> byCategoryId = productRepository.findByCategoryId(categoryId, pageable);

    return byCategoryId.stream()
        .map(p -> {
          Category category = categoryRepository.findById(p.getCategoryId())
              .orElseThrow(() -> new NoSuchElementException("Category not found"));
          return ProductMapper.toDto(p, category);
        }).toList();
  }
}
