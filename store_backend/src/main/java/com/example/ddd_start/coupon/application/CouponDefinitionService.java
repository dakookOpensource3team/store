package com.example.ddd_start.coupon.application;

import com.example.ddd_start.common.domain.Money;
import com.example.ddd_start.coupon.application.model.CouponDefinitionDto;
import com.example.ddd_start.coupon.application.model.RegisterCouponDefinitionCommand;
import com.example.ddd_start.coupon.application.model.UpdateCouponDefinitionCommand;
import com.example.ddd_start.coupon.domain.CouponDefinition;
import com.example.ddd_start.coupon.domain.CouponDefinitionRepository;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CouponDefinitionService {

  private final CouponDefinitionRepository couponDefinitionRepository;

  @Transactional
  public CouponDefinitionDto register(
      RegisterCouponDefinitionCommand cmd) {

    CouponDefinition couponDefinition = couponDefinitionRepository.save(
        new CouponDefinition(
            cmd.name(),
            cmd.isRatio(),
            cmd.ratio(),
            new Money(cmd.fixedAmount())
        )
    );

    couponDefinitionRepository.save(couponDefinition);

    return new CouponDefinitionDto(
        couponDefinition.getId(),
        couponDefinition.getName(),
        couponDefinition.getIsRatio(),
        couponDefinition.getRatio(),
        couponDefinition.getFixedAmount(),
        couponDefinition.getCreatedAt(),
        couponDefinition.getUpdatedAt(),
        couponDefinition.getExpiredAt()
    );
  }

  @Transactional
  public CouponDefinitionDto update(UpdateCouponDefinitionCommand cmd) {
    CouponDefinition couponDefinition = couponDefinitionRepository.findById(cmd.id())
        .orElseThrow(RuntimeException::new);

    couponDefinition.update(
        cmd.name(),
        cmd.isRatio(),
        cmd.ratio(),
        new Money(cmd.fixedAmount())
    );

    return new CouponDefinitionDto(
        couponDefinition.getId(),
        couponDefinition.getName(),
        couponDefinition.getIsRatio(),
        couponDefinition.getRatio(),
        couponDefinition.getFixedAmount(),
        couponDefinition.getCreatedAt(),
        couponDefinition.getUpdatedAt(),
        couponDefinition.getExpiredAt()
    );
  }

  @Transactional(readOnly = true)
  public List<CouponDefinitionDto> printAllValidated() {
    return couponDefinitionRepository.findByExpiredAtAfter(Instant.now())
        .stream()
        .map(couponDefinition ->
            new CouponDefinitionDto(
                couponDefinition.getId(),
                couponDefinition.getName(),
                couponDefinition.getIsRatio(),
                couponDefinition.getRatio(),
                couponDefinition.getFixedAmount(),
                couponDefinition.getCreatedAt(),
                couponDefinition.getUpdatedAt(),
                couponDefinition.getExpiredAt()
            )
        ).toList();
  }

  @Transactional
  public void delete(Long id) {
    couponDefinitionRepository.deleteById(id);
  }
}
