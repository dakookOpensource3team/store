package com.example.ddd_start.product.application.service;

import com.example.ddd_start.product.domain.Product;
import com.example.ddd_start.product.domain.ProductRepository;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeleteProductService {

  private final ProductRepository productRepository;

  public void removeOptions(Long productId, int optIdx) {
    Product product = productRepository.findById(productId)
        .orElseThrow(NoSuchElementException::new);
  }

  public void delete(Long productId) {
    productRepository.deleteById(productId);
  }
}
