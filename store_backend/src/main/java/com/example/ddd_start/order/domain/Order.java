package com.example.ddd_start.order.domain;

import static com.example.ddd_start.order.domain.value.OrderState.CANCEL;
import static com.example.ddd_start.order.domain.value.OrderState.PAYMENT_WAITING;
import static com.example.ddd_start.order.domain.value.OrderState.PREPARING;
import static com.example.ddd_start.order.domain.value.OrderState.SHIPPED;

import com.example.ddd_start.common.domain.Money;
import com.example.ddd_start.coupon.application.model.UserCouponDto;
import com.example.ddd_start.member.domain.MemberGrade;
import com.example.ddd_start.order.domain.event.OrderCanceledEvent;
import com.example.ddd_start.order.domain.event.OrderEvent;
import com.example.ddd_start.order.domain.event.ShippingInfoChangedEvent;
import com.example.ddd_start.order.domain.service.DiscountCalculationService;
import com.example.ddd_start.order.domain.value.OrderState;
import com.example.ddd_start.order.domain.value.Orderer;
import com.example.ddd_start.order.domain.value.PaymentInfo;
import com.example.ddd_start.order.domain.value.RefundState;
import com.example.ddd_start.order.domain.value.ShippingInfo;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.AttributeOverride;
import javax.persistence.AttributeOverrides;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Transient;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.annotation.Version;

@Getter
@Entity(name = "orders")
@NoArgsConstructor
@Slf4j
public class Order {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String orderNumber;
  @Enumerated(value = EnumType.STRING)
  private OrderState orderState;
  @Embedded
  @AttributeOverrides({
      @AttributeOverride(name = "receiver.name",
          column = @Column(name = "receiver_name")),
      @AttributeOverride(name = "receiver.phoneNumber",
          column = @Column(name = "receiver_phone_number"))
  })
  private ShippingInfo shippingInfo;
  private String message;
  @Transient
  List<OrderLine> orderLines;
  @Embedded
  @AttributeOverride(name = "amount", column = @Column(name = "total_amounts"))
  private Money totalAmounts;
  @Embedded
  private Orderer orderer;
  private Instant createdAt;
  @Embedded
  @AttributeOverride(name = "amount", column = @Column(name = "payment_amounts"))
  private Money paymentAmounts;
  @Enumerated(value = EnumType.STRING)
  private RefundState refundState;
  @Enumerated(value = EnumType.STRING)
  private PaymentInfo paymentInfo;
  private Long paymentId;
  @Version
  private Integer version;

  @Transient
  List<OrderEvent> orderEvents = new ArrayList<>();

  public Order(
      List<OrderLine> orderLines,
      ShippingInfo shippingInfo,
      String message,
      Orderer orderer,
      PaymentInfo paymentInfo) {
    this.orderNumber = generateOrderNumber();
    this.orderState = PREPARING;
    setOrderLines(orderLines);
    setShippingInfo(shippingInfo);
    this.message = message;
    setOrderer(orderer);
    this.paymentInfo = paymentInfo;
    this.createdAt = Instant.now();
  }

  private void setOrderer(Orderer orderer) {
    if (orderer == null) {
      throw new IllegalArgumentException("no orderer");
    }
    this.orderer = orderer;
  }

  private String generateOrderNumber() {
    LocalDateTime ldt = LocalDateTime.ofInstant(Instant.now(), ZoneOffset.UTC);
    String orderNumber =
        "" + ldt.getYear() + ldt.getMonthValue() + ldt.getHour() + ldt.getMinute() + String.format(
            "%04d", ldt.toString().hashCode());
    return orderNumber;
  }

  private void setShippingInfo(ShippingInfo shippingInfo) {
    if (shippingInfo == null) {
      throw new IllegalArgumentException("no ShippingInfo");
    }
    this.shippingInfo = shippingInfo;
  }

  private void setOrderLines(List<OrderLine> orderLines) {
    if (orderLines.isEmpty() && orderLines == null) {
      throw new IllegalArgumentException("no OrderLine");
    }
    this.orderLines = orderLines;
    this.totalAmounts = calculateTotalAmounts();
  }

  private Money calculateTotalAmounts() {
    return new Money(this.orderLines.stream()
        .mapToInt(o -> o.getAmount().getAmount())
        .sum());
  }

  public void changeShippingInfo(ShippingInfo shippingInfo) {
    verifyNotYetShipped();
    this.shippingInfo = shippingInfo;
    orderEvents.add(new ShippingInfoChangedEvent(id, Instant.now(), this.shippingInfo));
  }


  public void completePayment() {
    if (orderState != PAYMENT_WAITING) {
      throw new IllegalStateException("이미 결제가 완료된 주문입니다.");
    }
    this.orderState = PREPARING;
  }

  public void changeShipped() {
    verifyNotYetShipped();
    if (this.orderState != PREPARING) {
      throw new IllegalStateException("결제과 완료됬을 때만 출고가 가능합니다.");
    }
    this.orderState = SHIPPED;
  }

  public void changeDelivering() {
    if (orderState != SHIPPED) {
      throw new IllegalStateException("출고가 안될 시 배달을 못합니다.");
    }
  }

  public void cancel() {
    verifyNotYetShipped();
    this.orderState = CANCEL;
    startRefund();
    orderEvents.add(new OrderCanceledEvent(id, paymentId));
  }

  private void verifyNotYetShipped() {
    if (!(orderState == PAYMENT_WAITING || orderState == PREPARING)) {
      throw new IllegalStateException("이미 출고 됬습니다.");
    }
  }

  public void calculateAmounts(
      DiscountCalculationService disCalSvc, MemberGrade grade, List<UserCouponDto> coupons
  ) {
    Money totalAmounts = getTotalAmounts();
    Money discountAmounts = disCalSvc.calculateDiscountAmounts(orderLines, coupons, grade);
    this.paymentAmounts = totalAmounts.subtract(discountAmounts);
  }

  public boolean matchVersion(Integer version) {
    return this.version.equals(version);
  }

  public void startRefund() {
    canRefund();
    this.refundState = RefundState.REFUND_START;
  }

  private void canRefund() {
    if (this.refundState != null) {
      throw new IllegalStateException("환불이 불가능한 상태입니다.");
    }
  }

  public void completeRefund() {
    verifyRefunding();
    this.refundState = RefundState.REFUND_COMPLETED;
  }

  private void verifyRefunding() {
    if (this.refundState == null) {
      throw new IllegalStateException("아직 환불 중이 아닙니다.");
    }
    if (this.refundState != RefundState.REFUND_START) {
      throw new IllegalStateException("이미 환불 되었습니다.");
    }
  }
}
