package com.example.ddd_start.member.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {

  Optional<Member> findMemberByUsername(String username);

  List<Member> findMemberByUsernameLike(String name, Pageable pageable);

  Page<Member> findPageMemberByUsernameLike(String name, Pageable pageable);

  List<Member> findByIdIn(Long[] blockingIds);

  Long countByEmail(String email);

  Long countByUsername(String username);
}
