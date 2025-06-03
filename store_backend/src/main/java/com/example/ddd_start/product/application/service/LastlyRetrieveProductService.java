package com.example.ddd_start.product.application.service;

import com.example.ddd_start.category.domain.Category;
import com.example.ddd_start.category.domain.CategoryRepository;
import com.example.ddd_start.member.domain.Member;
import com.example.ddd_start.member.domain.MemberRepository;
import com.example.ddd_start.product.application.service.model.ProductDTO;
import com.example.ddd_start.product.domain.LastlyRetrieveProduct;
import com.example.ddd_start.product.domain.LastlyRetrieveProductRepository;
import com.example.ddd_start.product.domain.Product;
import com.example.ddd_start.product.domain.ProductRepository;
import com.example.ddd_start.product.infrastructure.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LastlyRetrieveProductService {

  private final MemberRepository memberRepository;
  private final ProductRepository productRepository;
  private final LastlyRetrieveProductRepository lastlyRetrieveProductRepository;

  @Transactional
  public void saveLastlyRetrieveProduct(Long memberId, Long productId) {
    Member member = memberRepository.findById(memberId).orElseThrow(EntityNotFoundException::new);
    Product product = productRepository.findById(productId)
        .orElseThrow(EntityNotFoundException::new);
    lastlyRetrieveProductRepository.save(new LastlyRetrieveProduct(member, product, Instant.now()));
  }

  @Transactional
  public List<ProductDTO> printLastlyRetrieveProduct(Long memberId) {
    Member member = memberRepository.findById(memberId).orElseThrow(EntityNotFoundException::new);
    List<LastlyRetrieveProduct> lastlyRetrieveProducts =
        lastlyRetrieveProductRepository.findTop7LastlyRetrieveProductByMemberOrderByCreatedAtDesc(
            member);

    return lastlyRetrieveProducts.stream()
        .map(LastlyRetrieveProduct::getProduct)
        .map(it -> ProductMapper.toDto(it, new Category()))
        .toList();
  }
}
