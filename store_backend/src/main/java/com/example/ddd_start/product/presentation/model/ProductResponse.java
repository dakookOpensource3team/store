package com.example.ddd_start.product.presentation.model;

import com.example.ddd_start.product.application.service.model.ProductDTO;
import java.util.List;
import lombok.Data;

@Data
public class ProductResponse {

  private List<ProductDTO> productDTOS;

  public ProductResponse(List<ProductDTO> productDTOS) {
    this.productDTOS = productDTOS;
  }
}
