package com.example.ddd_start.product.application.service;

import com.example.ddd_start.category.application.service.model.CategoryDTO;
import com.example.ddd_start.category.domain.event.FetchCategoryEvent;
import com.example.ddd_start.product.application.service.model.ProductDTO;
import com.example.ddd_start.product.domain.ProductRepository;
import com.example.ddd_start.product.infrastructure.ProductMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class FetchProductService {

  private final static String DUMMY_DATA_API_URL = "https://api.escuelajs.co/api/v1/products";
  private final ProductRepository productRepository;
  private final ProductMapper productMapper;
  private final ApplicationEventPublisher eventPublisher;

  @Transactional
  public void fetchProducts() {
    RestTemplate restTemplate = new RestTemplate();
    HttpHeaders httpHeaders = new HttpHeaders(); //메타 정보(기본 정보)

    HttpEntity<String> request = new HttpEntity<>(httpHeaders); //요청할 데이터를 담은 객체
    ResponseEntity<List<ProductDTO>> response = restTemplate.exchange(
        DUMMY_DATA_API_URL,
        HttpMethod.GET,
        request,
        new ParameterizedTypeReference<List<ProductDTO>>() {
        }
    );

    List<ProductDTO> products = response.getBody();
    products.forEach(productDTO -> {
      CategoryDTO category = productDTO.getCategory();
      eventPublisher.publishEvent(
          new FetchCategoryEvent(category));
      if (!productRepository.existsByTitle(productDTO.getTitle())) {
        productRepository.save(productMapper.toEntity(productDTO));
      }
    });
  }

}
