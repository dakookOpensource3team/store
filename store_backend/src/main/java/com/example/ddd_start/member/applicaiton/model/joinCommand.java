package com.example.ddd_start.member.applicaiton.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class joinCommand {

  String email;
  String password;
  String username;
  String name;
  AddressCommand addressReq;
  String role;
}
