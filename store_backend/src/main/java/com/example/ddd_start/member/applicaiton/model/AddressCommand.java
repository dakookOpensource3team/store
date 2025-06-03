package com.example.ddd_start.member.applicaiton.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class AddressCommand {

  private String address;
  private String detailedAddress;
  private Integer zipCode;
}
