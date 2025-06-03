package com.example.ddd_start.member.presentation.model;

import com.example.ddd_start.member.applicaiton.model.AddressCommand;

public record UpdateMemberRequest(Long id, String email, String username, String name,
                                  AddressCommand addressReq) {

}
