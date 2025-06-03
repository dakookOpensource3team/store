package com.example.ddd_start.product.domain;

import com.example.ddd_start.member.domain.Member;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.Instant;

@Entity
@NoArgsConstructor
@Getter
public class LastlyRetrieveProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    Member member;
    @ManyToOne
    Product product;
    Instant createdAt;

    public LastlyRetrieveProduct(Member member, Product product, Instant createdAt) {
        this.member = member;
        this.product = product;
        this.createdAt = createdAt;
    }
}
