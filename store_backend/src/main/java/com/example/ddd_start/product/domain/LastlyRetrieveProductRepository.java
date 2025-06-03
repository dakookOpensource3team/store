package com.example.ddd_start.product.domain;

import com.example.ddd_start.member.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LastlyRetrieveProductRepository extends JpaRepository<LastlyRetrieveProduct, Long> {
    public List<LastlyRetrieveProduct> findTop7LastlyRetrieveProductByMemberOrderByCreatedAtDesc(Member member);

    @Modifying
    @Query("delete from LastlyRetrieveProduct lrp where lrp.member.id = :memberId")
    public void deleteAllByMemberId(Long memberId);

}
