package com.example.ddd_start.member.applicaiton;

import com.example.ddd_start.common.domain.exception.NoMemberFoundException;
import com.example.ddd_start.common.domain.exception.PasswordNotMatchException;
import com.example.ddd_start.member.applicaiton.model.ChangePasswordCommand;
import com.example.ddd_start.member.domain.Member;
import com.example.ddd_start.member.domain.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChangePasswordService {

  private final MemberRepository memberRepository;
  private final PasswordEncoder passwordEncoder;

  @Transactional
  public void changePassword(ChangePasswordCommand req) throws NoMemberFoundException {
    Member member = memberRepository.findById(req.getMemberId())
        .orElseThrow(NoMemberFoundException::new);

    if (!passwordEncoder.matches(req.getCurPw(), member.getPassword())) {
      throw new PasswordNotMatchException();
    }

    member.changePassword(passwordEncoder.encode(req.getNewPw()));
  }
}
