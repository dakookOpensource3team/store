package com.example.ddd_start.product.application.service;

import com.example.ddd_start.category.domain.CategoryRepository;
import com.example.ddd_start.common.domain.Money;
import com.example.ddd_start.product.application.service.model.NewProductRequest;
import com.example.ddd_start.product.application.service.model.UpdateProductRequest;
import com.example.ddd_start.product.domain.Product;
import com.example.ddd_start.product.domain.ProductInfo;
import com.example.ddd_start.product.domain.ProductRepository;
import com.example.ddd_start.store.domain.Store;
import com.example.ddd_start.store.domain.StoreRepository;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegisterProductService {

  private final StoreRepository storeRepository;
  private final ProductRepository productRepository;
  private final CategoryRepository categoryRepository;

  @Transactional
  public Long registerNewProduct(NewProductRequest req) {
    Store store = storeRepository.findById(req.getStoreId())
        .orElseThrow(NoSuchElementException::new);
    Product product = store.createProduct(
        new ProductInfo(req.getTitle(), req.getSlug(), req.getPrice(), req.getDescription(),
            req.getCategoryId(), req.getImages()));
    productRepository.save(product);

    return product.getId();
  }

  @Transactional
  public Long registerProductNoStore(NewProductRequest req) {
    Product product = new Product(
        req.getTitle(),
        req.getSlug(),
        new Money(req.getPrice()),
        req.getDescription(),
        req.getCategoryId(),
        req.getImages(),
        null
    );
    productRepository.save(product);
    return product.getId();
  }

  @Transactional
  public Long updateProduct(UpdateProductRequest req) {
    Product product = productRepository.findById(req.getProductId())
        .orElseThrow(NoSuchElementException::new);
    product.updateProduct(
        req.getTitle(),
        req.getSlug(),
        new Money(req.getPrice()),
        req.getDescription(),
        req.getCategoryId(),
        req.getImages(),
        null
    );
    productRepository.save(product);
    return product.getId();
  }
}
