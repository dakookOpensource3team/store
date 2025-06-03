package com.example.ddd_start.coupon.presentation;

import com.example.ddd_start.coupon.application.UserCouponService;
import com.example.ddd_start.coupon.application.model.UserCouponDto;
import com.example.ddd_start.coupon.presentation.model.RegisterUserCouponRequest;
import com.example.ddd_start.coupon.presentation.model.RegisterUserCouponResponse;
import com.example.ddd_start.coupon.presentation.model.UpdateUserCouponRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UserCouponController {

  private final UserCouponService userCouponService;

  @GetMapping("/user-coupons/{memberId}")
  public ResponseEntity printAll(@PathVariable("memberId") Long memberId) {
    List<UserCouponDto> dtos = userCouponService.findByMemberId(memberId);

    return ResponseEntity.ok(dtos);
  }

  @PostMapping("/user-coupons")
  public ResponseEntity register(@RequestBody RegisterUserCouponRequest req) {
    Long userCouponId = userCouponService.register(
        req.memberId(),
        req.couponDefinitionId()
    );

    return ResponseEntity
        .ok(new RegisterUserCouponResponse(userCouponId, "쿠폰이 정상적으로 등록되었습니다."));
  }

  @PutMapping("/user-coupons")
  public ResponseEntity update(@RequestBody UpdateUserCouponRequest req) {
    userCouponService.update(
        new UserCouponDto(
            req.id(),
            req.name(),
            req.isUsed(),
            req.isRatio(),
            req.ratio(),
            req.fixedAmount()
        )
    );

    return ResponseEntity
        .ok("쿠폰이 정상적으로 변경되었습니다.");
  }

  @DeleteMapping("/user-coupons")
  public ResponseEntity delete(@RequestParam Long userCouponId) {
    userCouponService.delete(userCouponId);

    return ResponseEntity
        .ok("쿠폰이 정상적으로 삭제되었습니다.");
  }
}
