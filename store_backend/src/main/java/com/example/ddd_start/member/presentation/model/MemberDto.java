package com.example.ddd_start.member.presentation.model;

import com.example.ddd_start.common.domain.Address;

public record MemberDto(Long memberId, String username, String name, String email,
                        String role,
                        Address address) {

}
