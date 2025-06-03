package com.example.ddd_start.member.applicaiton.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class ChangePasswordCommand {

  private final Long memberId;
  private final String curPw;
  private final String newPw;
}
