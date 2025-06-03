package com.example.ddd_start.member.applicaiton;

import com.example.ddd_start.auth.JwtTokenProvider;
import com.example.ddd_start.auth.model.JwtToken;
import com.example.ddd_start.member.applicaiton.model.SignInCommand;
import com.example.ddd_start.member.domain.Member;
import com.example.ddd_start.member.domain.MemberRepository;
import com.example.ddd_start.member.presentation.model.MemberDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {

  private final MemberRepository memberRepository;
  private final AuthenticationManagerBuilder authenticationManagerBuilder;
  private final JwtTokenProvider jwtTokenProvider;

  @Transactional(readOnly = true)
  public void findMemberByName(String name) {
    Sort sort = Sort.by("id").descending();

    PageRequest pageRequest = PageRequest.of(0, 10, sort);

    List<Member> result = memberRepository.findMemberByUsernameLike(name, pageRequest);
    result.forEach(
        e -> log.info("member Address: " + e.getAddress())
    );
  }

  @Transactional(readOnly = true)
  public void findPageMemberByName(String name) {
    PageRequest pageRequest = PageRequest.of(0, 10);

    Page<Member> result = memberRepository.findPageMemberByUsernameLike(name,
        pageRequest);
  }

  @Transactional
  public void blockMembers(Long[] blockingIds) {
    if (blockingIds == null | blockingIds.length == 0) {
      return;
    }

    List<Member> members = memberRepository.findByIdIn(blockingIds);
    for (Member member : members) {
      member.block();
    }
  }

  @Transactional(readOnly = true)
  public JwtToken signIn(SignInCommand cmd) {
    UsernamePasswordAuthenticationToken authenticationToken =
        new UsernamePasswordAuthenticationToken(cmd.username(), cmd.password());

    Authentication authentication =
        authenticationManagerBuilder.getObject().authenticate(authenticationToken);

    return jwtTokenProvider.generateToken(authentication);
  }

  public MemberDto getMember(String name) {
    Member member = memberRepository.findMemberByUsername(name)
        .orElseThrow(IllegalArgumentException::new);
    return new MemberDto(member.getId(), member.getUsername(), member.getName(), member.getEmail(),
        member.getRoles().get(0),
        member.getAddress());
  }
}
