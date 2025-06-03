package com.example.ddd_start.common.config;

import static com.example.ddd_start.common.application.event.Events.setEventPublisher;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EventsConfiguration {

  @Autowired
  private ApplicationContext applicationContext;

  @Bean
  public InitializingBean eventInitializer() {
    return () -> setEventPublisher(applicationContext);
  }
}
