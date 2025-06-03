package com.example.ddd_start.common.infrastructure.lock;

import com.example.ddd_start.common.domain.exception.AlreadyLockException;
import com.example.ddd_start.common.domain.exception.LockingFailException;
import com.example.ddd_start.common.domain.exception.NoLockException;
import com.example.ddd_start.common.domain.lock.LockData;
import com.example.ddd_start.common.domain.lock.LockDataId;
import com.example.ddd_start.common.domain.lock.LockException;
import com.example.ddd_start.common.domain.lock.LockId;
import com.example.ddd_start.common.domain.lock.LockManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class SpringLockManager implements LockManager {

  private static final long LOCK_TIME_OUT = 1;
  private final JdbcTemplate jdbcTemplate;

  private RowMapper<LockData> lockDataRowMapper = (rs, rowNum) ->
      new LockData(rs.getObject(1, LockDataId.class),
          rs.getObject(2, LockId.class),
          rs.getObject(3, Instant.class));

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  @Override
  public LockId tryLock(String type, String id) throws LockException {
    checkAlreadyLocked(type, id);
    LockId lockId = new LockId(UUID.randomUUID().toString());
    locking(type, id, lockId);
    return lockId;
  }

  private void checkAlreadyLocked(String type, String id) {
    List<LockData> locks = jdbcTemplate.query(
        "select * from locks where type = ? and id = ?",
        lockDataRowMapper, type, id);
    Optional<LockData> lockData = handleExpiration(locks);
    if (lockData.isPresent()) {
      throw new AlreadyLockException();
    }
  }

  private Optional<LockData> handleExpiration(List<LockData> locks) {
    if(locks.isEmpty()) return Optional.empty();

    LockData lockData = locks.get(0);
    if (lockData.isExpired()) {
      jdbcTemplate.update(
          "delete  from locks where type =? and id = ?",
          lockData.getLockDataId().getType(), lockData.getLockDataId().getId()
      );
      return Optional.empty();
    } else {
      return Optional.of(lockData);
    }
  }

  private void locking(String type, String id, LockId lockId) {
    try {
      int updatedCount = jdbcTemplate.update(
          "insert into locks values (?, ?, ?, ?)",
          type, id, lockId.getValue(), Instant.now().plus(LOCK_TIME_OUT, ChronoUnit.MINUTES));

      if (updatedCount == 0) {
        throw new LockingFailException();
      }
    } catch (DuplicateKeyException e) {
      throw new LockingFailException();
    }
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  @Override
  public void checkLock(LockId lockId) throws LockException {
    Optional<LockData> lockData = getLockData(lockId);
    if (!lockData.isPresent()) {
      throw new NoLockException();
    }
  }

  private Optional<LockData> getLockData(LockId lockId) {
    List<LockData> lockData = jdbcTemplate.query(
        "select * from locks where lock_id = ?",
        lockDataRowMapper, lockId.getValue());

    return handleExpiration(lockData);
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  @Override
  public void releaseLock(LockId lockId) throws LockException {
    jdbcTemplate.update(
        "delete from locks where lock_id = ?", lockId.getValue());
  }

  @Override
  public void extendLockExpiration(LockId lockId, Long inc) throws LockException {
    Optional<LockData> lockDataOpt = getLockData(lockId);
    LockData lockData = lockDataOpt.orElseThrow(NoLockException::new);

    jdbcTemplate.update(
        "update locks set expiration_time = ? where type =? and id = ?",
        lockData.getExpiration_time().plus(inc, ChronoUnit.MINUTES),
        lockData.getLockDataId().getType(), lockData.getLockDataId().getId());
  }
}
