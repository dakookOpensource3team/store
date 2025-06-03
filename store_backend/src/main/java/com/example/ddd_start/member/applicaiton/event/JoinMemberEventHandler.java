package com.example.ddd_start.member.applicaiton.event;

import com.example.ddd_start.common.domain.Money;
import com.example.ddd_start.coupon.domain.UserCoupon;
import com.example.ddd_start.coupon.domain.UserCouponRepository;
import com.example.ddd_start.member.domain.Member;
import com.example.ddd_start.member.domain.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class JoinMemberEventHandler {
  private final MemberRepository memberRepository;
  private final UserCouponRepository userCouponRepository;

  @Async
  @EventListener(JoinMemberEvent.class)
  @Transactional
  public void joinMember(JoinMemberEvent event) {
    Member member = event.member();

    UserCoupon userCoupon = new UserCoupon("신규 회원 10%할인 쿠폰",
        false,
        true,
        0.1f,
        member,
        new Money(0));

    userCouponRepository.save(userCoupon);
  }
}
