package com.example.ddd_start.member.presentation.model;

import com.example.ddd_start.member.applicaiton.model.AddressCommand;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class JoinMemberRequest {

  String email;
  String password;
  String username;
  String name;
  AddressCommand addressReq;
}
