package com.example.ddd_start.common.domain.exception;

public class NoOrderException extends RuntimeException{
  public NoOrderException() {
    super("해당 id를 가지는 오더가 존재하지 않습니다.");
  }
}
