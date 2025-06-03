package com.example.ddd_start.common.domain.exception;

import com.example.ddd_start.common.domain.error.ValidationError;
import java.util.List;
import lombok.Getter;

@Getter
public class ValidationErrorException extends Throwable {

  List<ValidationError> errors;
  public ValidationErrorException(List<ValidationError> errors) {
    this.errors = errors;
  }
}
