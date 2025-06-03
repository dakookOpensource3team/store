package com.example.ddd_start.common.infrastructure.moeny_converter;

import com.example.ddd_start.common.domain.Money;
import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

@Converter()
public class MoneyConverter implements AttributeConverter<Money, Integer> {

  @Override
  public Integer convertToDatabaseColumn(Money money) {
    return money == null ? null : money.getAmount();
  }

  @Override
  public Money convertToEntityAttribute(Integer value) {
    return value == null ? null : new Money(value);
  }
}
