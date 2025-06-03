package com.example.ddd_start.order.domain;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface CartRepository extends JpaRepository<Cart, Long> {
  public Optional<Cart> findByMemberIdAndProductId(Long memberId, Long productId);
  public List<Cart> findByMemberId(Long memberId);

  @Modifying
  @Query("delete from Cart c where c.member.id = :memberId")
  public void deleteByMemberId(Long memberId);
}
