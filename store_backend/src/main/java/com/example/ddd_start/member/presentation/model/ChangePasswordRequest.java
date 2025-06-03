package com.example.ddd_start.member.presentation.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

public record ChangePasswordRequest(Long memberId, String curPw, String newPw) {

}
