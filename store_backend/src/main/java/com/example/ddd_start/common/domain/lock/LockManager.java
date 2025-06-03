package com.example.ddd_start.common.domain.lock;

public interface LockManager {

  LockId tryLock(String type, String id) throws LockException;

  void checkLock(LockId lockId) throws LockException;

  void releaseLock(LockId lockId) throws LockException;

  void extendLockExpiration(LockId lockId, Long inc) throws LockException;

}
