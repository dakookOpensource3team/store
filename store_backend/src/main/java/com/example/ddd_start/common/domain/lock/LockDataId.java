package com.example.ddd_start.common.domain.lock;

import java.io.Serializable;
import javax.persistence.Embeddable;
import lombok.Getter;

@Getter
@Embeddable
public class LockDataId implements Serializable {

  private String type;
  private String id;
}
