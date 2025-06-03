package com.example.ddd_start.common.domain.error;

import lombok.Getter;

@Getter
public class ValidationError {

  private final String propertyName;
  private final String value;

  protected ValidationError(String value) {
    this.value = value;
    this.propertyName = null;
  }

  protected ValidationError(String propertyName, String value) {
    this.propertyName = propertyName;
    this.value = value;
  }

  public static ValidationError of(String value) {
    return new ValidationError(value);
  }

  public static ValidationError of(String propertyName, String value) {
    return new ValidationError(propertyName, value);
  }

  public boolean hasName() {
    return this.propertyName.isBlank();
  }

}
