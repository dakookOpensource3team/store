package com.example.ddd_start.member.applicaiton;

import com.example.ddd_start.member.domain.Member;
import com.example.ddd_start.member.domain.MemberRepository;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BlockMemberService {

  private final MemberRepository memberRepository;

//  @PreAuthorize("hasRole('ADMIN')")
//  public void block(Long memberId) {
//    Member member = memberRepository.findById(memberId).orElseThrow(NoSuchElementException::new);
//    member.block();
//  }

}
