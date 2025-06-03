package com.example.ddd_start.order.domain;

import com.example.ddd_start.member.domain.Member;
import com.example.ddd_start.product.domain.Product;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor
public class Cart {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @ManyToOne
  private Member member;
  @ManyToOne
  private Product product;
  private Integer quantity;

  public Cart(Member member, Product product, Integer quantity) {
    this.member = member;
    this.product = product;
    this.quantity = quantity;
  }

  public void update(Integer quantity) {
    this.quantity = quantity;
  }

  public void add(Integer quantity) {
    this.quantity += quantity;
  }
}
