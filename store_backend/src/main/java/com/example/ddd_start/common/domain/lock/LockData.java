package com.example.ddd_start.common.domain.lock;

import java.time.Instant;
import javax.persistence.AttributeOverride;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "locks")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class LockData {

  @EmbeddedId
  private LockDataId lockDataId;
  @Embedded
  @AttributeOverride(name = "value", column = @Column(name = "lock_id"))
  private LockId lockId;
  private Instant expiration_time;

  public Boolean isExpired() {
    return expiration_time.isBefore(Instant.now());
  }
}
