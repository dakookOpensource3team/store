package com.example.ddd_start.product.domain;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductCategoryRepository extends
    JpaRepository<ProductCategory, Long> {

}
