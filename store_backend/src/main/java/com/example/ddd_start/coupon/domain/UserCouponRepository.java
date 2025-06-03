package com.example.ddd_start.coupon.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface UserCouponRepository extends JpaRepository<UserCoupon, Long> {

  @Modifying
  @Query("delete from UserCoupon uc where uc.member.id = :memberId")
  public void deleteAllByMemberId(Long memberId);

  public List<UserCoupon> findAllByMemberIdAndIsUsedFalse(Long memberId);

}
