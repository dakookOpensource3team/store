package com.example.ddd_start.coupon.presentation;

import com.example.ddd_start.coupon.application.CouponDefinitionService;
import com.example.ddd_start.coupon.application.model.CouponDefinitionDto;
import com.example.ddd_start.coupon.application.model.RegisterCouponDefinitionCommand;
import com.example.ddd_start.coupon.application.model.UpdateCouponDefinitionCommand;
import com.example.ddd_start.coupon.presentation.model.RegisterCouponDefinitionRequest;
import com.example.ddd_start.coupon.presentation.model.RegisterCouponDefinitionResponse;
import com.example.ddd_start.coupon.presentation.model.UpdateCouponDefinitionRequest;
import com.example.ddd_start.coupon.presentation.model.UpdateCouponDefinitionResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class CouponDefinitionController {

  private final CouponDefinitionService couponDefinitionService;

  @GetMapping("/coupon-definition")
  public ResponseEntity printAllValidated() {
    List<CouponDefinitionDto> dtos = couponDefinitionService.printAllValidated();
    return ResponseEntity.ok(dtos);
  }

  @PostMapping("/coupon-definition")
  public ResponseEntity register(@RequestBody RegisterCouponDefinitionRequest req) {
    CouponDefinitionDto register = couponDefinitionService.register(
        new RegisterCouponDefinitionCommand(
            req.name(),
            req.isRatio(),
            req.ratio(),
            req.fixedAmount()
        ));

    return ResponseEntity
        .ok(new RegisterCouponDefinitionResponse(register, "쿠폰이 정상적으로 정의되었습니다."));
  }

  @PutMapping("/coupon-definition")
  public ResponseEntity update(@RequestBody UpdateCouponDefinitionRequest req) {
    CouponDefinitionDto update = couponDefinitionService.update(
        new UpdateCouponDefinitionCommand(
            req.id(),
            req.name(),
            req.isRatio(),
            req.ratio(),
            req.fixedAmount()
        )
    );

    return ResponseEntity
        .ok(new UpdateCouponDefinitionResponse(update, "쿠폰 정의가 정상적으로 변경되었습니다."));
  }

  @DeleteMapping("coupon-definition")
  public ResponseEntity delete(@RequestParam("id") Long id) {
    couponDefinitionService.delete(id);

    return ResponseEntity.ok().build();
  }


}
