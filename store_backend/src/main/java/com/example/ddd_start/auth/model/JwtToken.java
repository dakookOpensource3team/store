package com.example.ddd_start.auth.model;

import lombok.Builder;

@Builder
public record JwtToken(String grantType, String accessToken, String refreshToken) {
}
