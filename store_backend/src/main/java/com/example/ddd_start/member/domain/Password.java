package com.example.ddd_start.member.domain;

import javax.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@NoArgsConstructor
public class Password {

  String password;

  public Password(String password) {
    this.password = password;
  }

  public boolean match(String currentPassword) {
    return this.password.equals(currentPassword);
  }
}
