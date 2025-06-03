package com.example.ddd_start.member.domain;

public interface PasswordEncryptionEngine {

  String encryptKey(String password);

  String decryptKey(String encryptKey);
}
