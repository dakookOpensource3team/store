package com.example.ddd_start.order.domain;

import com.example.ddd_start.order.domain.dto.OrderDto;
import com.example.ddd_start.order.domain.dto.OrderResponseDto;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import javax.persistence.LockModeType;
import javax.persistence.QueryHint;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends CrudRepository<Order, Long>, OrderRepositoryCustom {

  @Query(value =
      "select new com.example.ddd_start.order.domain.dto.OrderResponseDto(o, m, p) "
          + "from orders o join Member m, Product p "
          + "where o.orderer.memberId = :memberId "
          + "and o.orderer.memberId = m.id ")
  List<OrderResponseDto> findOrdersByMemberId(@Param("memberId") Long memberId);

  List<Order> findOrdersByIdOrderByCreatedAtDesc(Long id);

  List<Order> findOrdersByIdOrderByCreatedAtDescTotalAmounts(Long id);

  List<Order> findAllByIdAndCreatedAtBetween(Long id, Instant startAt, Instant endedAt);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @QueryHints({
      @QueryHint(name = "javax.persistence.lock.timeout", value = "2000")
  })
  @Query("select o from orders o where o.id = :id")
  Optional<Order> findByIdPessimistic(Long id);


  @Lock(LockModeType.OPTIMISTIC)
  @QueryHints({
      @QueryHint(name = "javax.persistence.lock.timeout", value = "2000")
  })
  @Query("select o from orders o where o.id = :id")
  Optional<Order> findByIdOptimistic(Long id);

  @Query("select o from orders o where o.orderer.memberId = :memberId")
  List<Order> findOrderByMemberId(@Param("memberId") Long memberId);

  @Modifying
  @Query("delete from orders o where o.orderer.memberId = :memberId")
  void deleteByMemberId(Long memberId);
}
