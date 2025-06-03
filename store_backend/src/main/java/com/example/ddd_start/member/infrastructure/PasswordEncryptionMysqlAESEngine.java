package com.example.ddd_start.member.infrastructure;

import com.example.ddd_start.member.domain.PasswordEncryptionEngine;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import org.apache.commons.codec.binary.Hex;
import org.apache.tomcat.util.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class PasswordEncryptionMysqlAESEngine implements PasswordEncryptionEngine {

  private final String secretKey;

  public PasswordEncryptionMysqlAESEngine(
      @Value("${password.secretKey}") String secretKey) {
    this.secretKey = secretKey;
  }

  @Override
  public String encryptKey(String password) {
    try {
      Cipher encryptCipher = Cipher.getInstance("AES");
      encryptCipher.init(Cipher.ENCRYPT_MODE, MySqlSetKey(secretKey, "UTF-8"));
      return new String(
          Hex.encodeHex(encryptCipher.doFinal(password.getBytes("UTF-8"))))
          .toUpperCase();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }

  }

  @Override
  public String decryptKey(String encryptedPassword) {
    try {
      Cipher decryptCipher = Cipher.getInstance("AES");
      decryptCipher.init(Cipher.DECRYPT_MODE, MySqlSetKey(secretKey, "UTF-8"));
      return new String(decryptCipher.doFinal(Hex.decodeHex(encryptedPassword.toCharArray())));
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  public static SecretKeySpec MySqlSetKey(String secretKey, String encoding) {
    try {
      final byte[] finalKey = new byte[16];
      int i = 0;
      for (byte b : secretKey.getBytes(encoding)) {
        finalKey[i++ % 16] ^= b;
      }
      return new SecretKeySpec(finalKey, "AES");
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
}
