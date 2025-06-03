package com.example.ddd_start.coupon.domain;

import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponDefinitionRepository extends JpaRepository<CouponDefinition, Long> {

  List<CouponDefinition> findByExpiredAtAfter(Instant now);
}
