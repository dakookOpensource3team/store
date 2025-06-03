package com.example.ddd_start.order.domain;

import com.example.ddd_start.common.domain.Money;
import com.example.ddd_start.product.domain.Product;
import javax.persistence.AttributeOverride;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class OrderLine {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private Long product_id;
  private Long orderId;
  @Embedded
  @AttributeOverride(name = "amount", column = @Column(name = "amount"))
  private Money amount;
  @Embedded
  @AttributeOverride(name = "amount", column = @Column(name = "price"))
  private Money price;
  private Integer quantity;

  public OrderLine(Product product, Order order, Integer price, Integer quantity) {
    changeProduct(product);
    changeOrder(order);
    this.quantity = quantity;
    this.price = new Money(price);
    this.amount = calculateAmount();
  }

  public OrderLine(Product product, Integer price, Integer quantity) {
    changeProduct(product);
    this.quantity = quantity;
    this.price = new Money(price);
    this.amount = calculateAmount();
  }

  private Money calculateAmount() {
    return this.price.multiply(quantity);
  }

  public void changeOrder(Order order) {
    this.orderId = order.getId();
  }

  private void changeProduct(Product product) {
    this.product_id = product.getId();
  }
}
