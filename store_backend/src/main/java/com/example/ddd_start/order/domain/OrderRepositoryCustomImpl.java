package com.example.ddd_start.order.domain;

import static com.example.ddd_start.order.domain.QOrder.order;

import com.example.ddd_start.order.domain.dto.OrderDto;
import com.example.ddd_start.order.domain.value.OrderState;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.util.List;
import javax.persistence.EntityManager;

public class OrderRepositoryCustomImpl implements OrderRepositoryCustom {

  private final JPAQueryFactory queryFactory;

  public OrderRepositoryCustomImpl(EntityManager em) {
    this.queryFactory = new JPAQueryFactory(em);
  }

  @Override
  public List<OrderDto> searchMyOrders(OrderSearchCondition orderSearchCondition) {
    List<OrderDto> result = queryFactory
        .select(Projections.constructor(OrderDto.class,
            order.orderNumber,
            order.orderState,
            order.shippingInfo,
            order.totalAmounts,
            order.orderer.name,
            order.createdAt
        ))
        .from(order)
        .where(ordererIdEq(orderSearchCondition.getOrdererId()))
        .fetch();

    return result;
  }

  @Override
  public List<OrderDto> searchMyStateOrders(
      OrderSearchCondition orderSearchCondition) {
    BooleanBuilder builder = new BooleanBuilder();
    if (orderSearchCondition.getOrdererId() != null) {
      builder.and(ordererIdEq(orderSearchCondition.getOrdererId()));
    }
    if (orderSearchCondition.getOrderState() != null) {
      builder.and(orderStateEq(orderSearchCondition.getOrderState()));
    }

    List<OrderDto> result = queryFactory
        .select(Projections.constructor(OrderDto.class,
            order.orderNumber,
            order.orderState,
            order.shippingInfo,
            order.totalAmounts,
            order.orderer.name,
            order.createdAt
        ))
        .from(order)
        .where(builder)
        .fetch();

    return result;
  }

  @Override
  public List<OrderDto> search() {
    return queryFactory
        .select(Projections.constructor(OrderDto.class,
            order.orderNumber,
            order.orderState,
            order.shippingInfo,
            order.totalAmounts,
            order.orderer.name,
            order.createdAt
        ))
        .from(order)
        .fetch();
  }

  private BooleanExpression ordererIdEq(Long ordererId) {
    return ordererId == null ? null : order.orderer.memberId.eq(ordererId);
  }

  private BooleanExpression orderStateEq(OrderState orderState) {
    return orderState == null ? null : order.orderState.eq(orderState);
  }
}
