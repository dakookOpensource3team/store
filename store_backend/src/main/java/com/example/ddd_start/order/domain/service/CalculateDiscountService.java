package com.example.ddd_start.order.domain.service;

import com.example.ddd_start.order.domain.CalculateRuleEngine;
import com.example.ddd_start.common.domain.Money;
import com.example.ddd_start.customer.domain.Customer;
import com.example.ddd_start.customer.domain.CustomerRepository;
import com.example.ddd_start.order.domain.OrderLine;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CalculateDiscountService {

  private final CalculateRuleEngine calculateRuleEngine;
  private final CustomerRepository customerRepository;

  public void calculateDiscount(List<OrderLine> orderLines, Long customerId) {
    Optional<Customer> optionalCustomer = customerRepository.findById(customerId);
    Customer customer = optionalCustomer.orElseThrow(NoSuchElementException::new);

    List<?> facts = Arrays.asList(customer, new Money(null));
    calculateRuleEngine.evaluate(facts);
  }
}
