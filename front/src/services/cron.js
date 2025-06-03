import ApiService from './api';

/**
 * 크론 작업 관리자
 */
class CronManager {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  /**
   * 크론 작업 시작
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // 상품 데이터 자동 갱신 (1시간마다)
    this.addJob('refreshProducts', 60 * 60 * 1000, async () => {
      try {
        console.log('상품 데이터 갱신 시작');
        await ApiService.getProducts({ page: 0, size: 8, forceRefresh: true });
        console.log('상품 데이터 갱신 완료');
      } catch (error) {
        console.error('상품 데이터 갱신 실패:', error);
      }
    });

    // 카테고리 데이터 갱신 (6시간마다)
    this.addJob('refreshCategories', 6 * 60 * 60 * 1000, async () => {
      try {
        console.log('카테고리 데이터 갱신 시작');
        await ApiService.getCategories({ forceRefresh: true });
        console.log('카테고리 데이터 갱신 완료');
      } catch (error) {
        console.error('카테고리 데이터 갱신 실패:', error);
      }
    });

    // 시스템 상태 체크 (5분마다)
    this.addJob('checkSystemStatus', 5 * 60 * 1000, async () => {
      try {
        const status = ApiService.getSystemStatus();
        console.log('시스템 상태:', status);

        // The following block is commented out because status.cache is not available from getSystemStatus()
        // if (status.cache.items.some(item => item.expiresIn < 30)) { 
        //   console.log('캐시 만료 임박, 데이터 갱신 시작');
        //   await ApiService.clearAllCache(); // Example: clear all cache if needed
        // }

        // If you want to periodically clear all cache, you could do it here directly, for example:
        // console.log('Periodically clearing all cache');
        // await ApiService.clearAllCache();

      } catch (error) {
        console.error('시스템 상태 체크 실패:', error);
      }
    });
  }

  /**
   * 크론 작업 중지
   */
  stop() {
    this.jobs.forEach((job) => {
      clearInterval(job.interval);
    });
    this.jobs.clear();
    this.isRunning = false;
  }

  /**
   * 크론 작업 추가
   * @param {string} name - 작업 이름
   * @param {number} interval - 실행 간격 (밀리초)
   * @param {Function} callback - 실행할 함수
   */
  addJob(name, interval, callback) {
    if (this.jobs.has(name)) {
      clearInterval(this.jobs.get(name).interval);
    }

    const job = {
      interval: setInterval(callback, interval),
      lastRun: null,
      nextRun: new Date().getTime() + interval,
    };

    this.jobs.set(name, job);
    
    // 최초 1회 즉시 실행
    callback().then(() => {
      job.lastRun = new Date().getTime();
    });
  }

  /**
   * 크론 작업 상태 조회
   */
  getStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        isRunning: this.isRunning,
        lastRun: job.lastRun ? new Date(job.lastRun) : null,
        nextRun: new Date(job.nextRun),
      };
    });
    return status;
  }
}

// 싱글톤 인스턴스 생성
const cronManager = new CronManager();

export default cronManager; 