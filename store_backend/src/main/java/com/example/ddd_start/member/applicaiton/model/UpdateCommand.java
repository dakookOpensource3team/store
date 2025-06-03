package com.example.ddd_start.member.applicaiton.model;

public record UpdateCommand(Long id, String email, String username, String name,
                            AddressCommand addressReq) {

}
