/**
 * API 서비스 - 백엔드 API와 연동
 * 백엔드 서버: http://localhost:8080
 */

import axios from 'axios';

// API 기본 설정 - Docker 환경에 맞춰 수정
const api = axios.create({
  baseURL: '/api',  // nginx 프록시를 통해 백엔드로 전달됨 (Docker 환경)
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 및 응답 데이터 표준화
api.interceptors.response.use(
  (response) => {
    // 백엔드 응답 구조에 맞춰서 데이터 반환
    return response.data;
  },
  (error) => {
    // 401 에러 처리 (인증 만료)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // 에러 메시지 표준화
    const errorMessage = error.response?.data?.message || error.message || '서버 오류가 발생했습니다.';
    return Promise.reject(new Error(errorMessage));
  }
);

// 캐시 유효 기간 설정 (밀리초 단위, 여기서는 24시간)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24시간

// API 게이트웨이 및 기본 URL 설정
const GATEWAY_URL = 'https://api.escuelajs.co/api/v1';

// 서킷 브레이커 상태 관리
const CIRCUIT_STATES = {
  CLOSED: 'CLOSED',  // 정상 작동
  OPEN: 'OPEN',      // 차단 상태
  HALF_OPEN: 'HALF_OPEN' // 테스트 상태
};

// 서킷 브레이커 설정값
const CIRCUIT_CONFIG = {
  failureThreshold: 3,     // 실패 임계값
  resetTimeout: 30 * 1000, // 30초 후 half-open으로 전환
  maxRetries: 2,           // 최대 재시도 횟수
};

// 서킷 브레이커 상태 객체
const circuitState = {
  status: CIRCUIT_STATES.CLOSED,
  failures: 0,
  lastFailureTime: null,
  nextAttempt: null
};

/**
 * API 요청 캐시 관리
 */
const ApiCache = {
  // 로컬 스토리지에서 캐시된 데이터 가져오기
  getCache: (key) => {
    try {
      const cachedData = localStorage.getItem(`api_cache_${key}`);
      if (!cachedData) return null;
      
      const { data, timestamp } = JSON.parse(cachedData);
      const now = new Date().getTime();
      
      // 캐시 만료 확인
      if (now - timestamp > CACHE_EXPIRATION) {
        localStorage.removeItem(`api_cache_${key}`);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('캐시 읽기 오류:', error);
      return null;
    }
  },
  
  // 데이터를 캐시에 저장
  setCache: (key, data) => {
    try {
      const cacheObject = {
        data,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(`api_cache_${key}`, JSON.stringify(cacheObject));
    } catch (error) {
      console.error('캐시 저장 오류:', error);
    }
  },
  
  // 특정 캐시 삭제
  clearCache: (key) => {
    localStorage.removeItem(`api_cache_${key}`);
  },
  
  // 전체 API 캐시 삭제
  clearAllCache: () => {
    Object.keys(localStorage)
      .filter(key => key.startsWith('api_cache_'))
      .forEach(key => localStorage.removeItem(key));
  }
};

/**
 * 서킷 브레이커 패턴 구현
 * PiggyMetrics의 Hystrix 패턴을 참고하여 간소화된 버전 구현
 */
const CircuitBreaker = {
  // 서킷 브레이커 상태 확인
  isOpen: () => {
    if (circuitState.status === CIRCUIT_STATES.CLOSED) {
      return false;
    }
    
    if (circuitState.status === CIRCUIT_STATES.OPEN) {
      const now = new Date().getTime();
      // 일정 시간이 지나면 half-open 상태로 전환
      if (circuitState.nextAttempt && now >= circuitState.nextAttempt) {
        circuitState.status = CIRCUIT_STATES.HALF_OPEN;
        return false;
      }
      return true;
    }
    
    return false;
  },
  
  // 요청 성공 시 서킷 브레이커 초기화
  onSuccess: () => {
    circuitState.status = CIRCUIT_STATES.CLOSED;
    circuitState.failures = 0;
    circuitState.lastFailureTime = null;
    circuitState.nextAttempt = null;
  },
  
  // 요청 실패 시 서킷 브레이커 업데이트
  onFailure: () => {
    circuitState.failures += 1;
    circuitState.lastFailureTime = new Date().getTime();
    
    // 실패 횟수가 임계값을 초과하면 서킷 오픈
    if (circuitState.failures >= CIRCUIT_CONFIG.failureThreshold) {
      circuitState.status = CIRCUIT_STATES.OPEN;
      circuitState.nextAttempt = circuitState.lastFailureTime + CIRCUIT_CONFIG.resetTimeout;
      console.log('서킷 브레이커가 OPEN 상태로 전환되었습니다. 일시적으로 API 요청이 차단됩니다.');
    }
  },
  
  // 현재 상태 로깅
  logStatus: () => {
    console.log(`서킷 브레이커 상태: ${circuitState.status}, 실패 횟수: ${circuitState.failures}`);
  }
};

/**
 * API 요청 공통 함수 - 서킷 브레이커 및 캐시 메커니즘 포함
 */
const apiRequest = async (url, options = {}, cacheKey = null, forceRefresh = false) => {
  // 서킷 브레이커가 열려있으면 캐시된 데이터 반환 또는 에러 발생
  if (CircuitBreaker.isOpen()) {
    console.log('서킷 브레이커가 열려 있습니다. 캐시된 데이터를 사용합니다.');
    if (cacheKey) {
      const cachedData = ApiCache.getCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    throw new Error('서비스가 일시적으로 불안정합니다. 잠시 후 다시 시도해주세요.');
  }

  // 캐시 확인
  if (cacheKey && !forceRefresh) {
    const cachedData = ApiCache.getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  try {
    // 요청 시작 시간 측정 (성능 모니터링)
    const startTime = new Date().getTime();
    
    // API 요청
    const response = await fetch(url, options);
    
    // 요청 종료 시간 측정
    const endTime = new Date().getTime();
    console.log(`API 요청 시간: ${endTime - startTime}ms, URL: ${url}`);
    
    // 응답 확인
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 요청 성공 시 서킷 브레이커 리셋
    CircuitBreaker.onSuccess();
    
    // 캐시 키가 있으면 캐싱
    if (cacheKey) {
      ApiCache.setCache(cacheKey, data);
    }
    
    return data;
  } catch (error) {
    // 요청 실패 시 서킷 브레이커 업데이트
    CircuitBreaker.onFailure();
    CircuitBreaker.logStatus();
    
    // 캐시에서 데이터 조회 시도
    if (cacheKey) {
      const cachedData = ApiCache.getCache(cacheKey);
      if (cachedData) {
        console.log('API 요청 실패, 캐시된 데이터를 반환합니다.', url);
        return cachedData;
      }
    }
    
    throw error;
  }
};

/**
 * API 서비스 객체 - 백엔드 컨트롤러와 1:1 매칭
 */
const ApiService = {
  // ===== Product Controller APIs =====
  
  /**
   * 모든 상품 조회
   * GET /products
   */
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response;
    } catch (error) {
      console.error('상품 조회 에러:', error);
      throw error;
    }
  },
  
  /**
   * 상품 조회 - 낮은 가격순
   * GET /products/low_price
   */
  getProductsByLowPrice: async (params = {}) => {
    try {
      const response = await api.get('/products/low_price', { params });
      return response;
    } catch (error) {
      console.error('낮은 가격순 상품 조회 에러:', error);
      throw error;
    }
  },
  
  /**
   * 상품 조회 - 높은 가격순
   * GET /products/high_price
   */
  getProductsByHighPrice: async (params = {}) => {
    try {
      const response = await api.get('/products/high_price', { params });
      return response;
    } catch (error) {
      console.error('높은 가격순 상품 조회 에러:', error);
      throw error;
    }
  },
  
  /**
   * 카테고리별 상품 조회
   * GET /products/category
   */
  getProductsByCategory: async (categoryId, params = {}) => {
    try {
      const response = await api.get('/products/category', { 
        params: { 
          categoryId,
          ...params 
        }
      });
      return response;
    } catch (error) {
      console.error('카테고리별 상품 조회 에러:', error);
      throw error;
    }
  },
  
  /**
   * 모든 카테고리 조회
   * GET /categories
   */
  getCategories: async (params = {}) => {
    try {
      const response = await api.get('/categories', { params });
      return response;
    } catch (error) {
      console.error('카테고리 조회 에러:', error);
      throw error;
    }
  },
  
  /**
   * 상품 생성
   * POST /products
   */
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response;
    } catch (error) {
      console.error('상품 생성 에러:', error);
      throw error;
    }
  },
  
  /**
   * 상품 수정
   * PUT /products
   */
  updateProduct: async (productData) => {
    try {
      const response = await api.put('/products', productData);
      return response;
    } catch (error) {
      console.error('상품 수정 에러:', error);
      throw error;
    }
  },
  
  /**
   * 상품 삭제
   * DELETE /products
   */
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete('/products', { data: { productId } });
      return response;
    } catch (error) {
      console.error('상품 삭제 에러:', error);
      throw error;
    }
  },
  
  /**
   * 최근 본 상품 조회
   * GET /products/lastly
   */
  getLastlyProducts: async () => {
    try {
      const response = await api.get('/products/lastly');
      return response;
    } catch (error) {
      console.error('최근 본 상품 조회 에러:', error);
      throw error;
    }
  },
  
  /**
   * 최근 본 상품 추가
   * POST /products/lastly
   */
  addLastlyProduct: async (memberId, productId) => {
    // 유효성 검사 추가
    if (!memberId || !productId) {
      const error = new Error(`최근 본 상품 추가: memberId 또는 productId가 유효하지 않습니다. ${memberId} ${productId}`);
      console.error(error.message);
      throw error;
    }
    
    try {
      console.log('최근 본 상품 API 호출:', { memberId, productId });
      const response = await api.post('/products/lastly', { memberId, productId });
      return response;
    } catch (error) {
      console.error('최근 본 상품 추가 에러:', error);
      throw error;
    }
  },

  /**
   * 개별 상품 조회
   * GET /products/{id}
   */
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response;
    } catch (error) {
      console.error('상품 상세 조회 에러:', error);
      throw error;
    }
  },

  /**
   * 상품 검색
   * GET /products/search?title=xxx
   */
  searchProducts: async (title) => {
    try {
      const response = await api.get('/products/search', { params: { title } });
      return response;
    } catch (error) {
      console.error('상품 검색 에러:', error);
      throw error;
    }
  },

  // ===== Member Controller APIs =====
  
  /**
   * 회원 로그인
   * POST /members/sign-in
   */
  signIn: async (email, password) => {
    try {
      // 백엔드의 SignInRequest DTO가 username 필드를 사용한다고 가정
      const response = await api.post('/members/sign-in', { username: email, password });
      console.log('Sign-in API Response:', response);

      // 백엔드 JwtToken 객체에 accessToken 필드가 있다고 가정
      if (response && response.accessToken) {
        localStorage.setItem('token', response.accessToken);
        console.log('Token saved to localStorage:', response.accessToken);
      } else {
        console.warn('Token not found in response or response is invalid:', response);
      }
      return response; // JwtToken 객체 또는 필요한 정보 반환
    } catch (error) {
      console.error('로그인 API 호출 에러:', error);
      // 에러 응답이 있다면 그대로 반환하여 Login.jsx에서 처리하도록 함
      if (error.response) {
        console.error('Error response data:', error.response.data);
        throw error.response;
      }
      throw error;
    }
  },

  /**
   * 회원 가입
   * POST /members/join
   */
  register: async (userData) => {
    try {
      console.log('회원가입 요청:', userData);
      const response = await api.post('/members/join', userData);
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      return response;
    } catch (error) {
      console.error('회원가입 에러:', error);
      console.error('에러 응답:', error.response);
      if (error.response && error.response.data) {
        console.error('에러 데이터:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * 관리자 회원 가입
   * POST /members/join/admin
   */
  registerAdmin: async (userData) => {
    try {
      console.log('관리자 회원가입 요청:', userData);
      const response = await api.post('/members/join/admin', userData);
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      return response;
    } catch (error) {
      console.error('관리자 회원가입 에러:', error);
      console.error('에러 응답:', error.response);
      if (error.response && error.response.data) {
        console.error('에러 데이터:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * 로그아웃 (토큰 제거)
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * 현재 사용자 정보 조회
   * GET /get-current-member
   */
  getCurrentMember: async () => {
    try {
      const response = await api.get('/get-current-member');
      return response;
    } catch (error) {
      console.error('현재 사용자 정보 조회 에러:', error);
      throw error;
    }
  },

  // ===== Order Controller APIs =====
  
  /**
   * 주문 생성
   * POST /orders/place-order
   */
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders/place-order', orderData);
      return response;
    } catch (error) {
      console.error('주문 생성 에러:', error);
      throw error;
    }
  },

  /**
   * 주문 목록 조회
   * GET /orders
   */
  getOrders: async () => {
    try {
      const response = await api.get('/orders');
      return response;
    } catch (error) {
      console.error('주문 조회 에러:', error);
      throw error;
    }
  },

  /**
   * 특정 주문 조회
   * GET /orders/{orderId}
   */
  getOrder: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response;
    } catch (error) {
      console.error('주문 상세 조회 에러:', error);
      throw error;
    }
  },

  // ===== 장바구니 APIs  =====
  
  /**
   * 장바구니 조회
   * GET /carts
   */
  getCart: async (memberId) => {
    const response = await api.get('/carts', { params: { memberId } });
    return response;
  },

  /**
   * 장바구니에 상품 추가
   * POST /carts
   */
  addToCart: async (cartData) => {
    const response = await api.post('/carts', cartData);
    return response;
  },

  /**
   * 장바구니 상품 수정
   * PUT /carts
   */
  updateCartItem: async (cartId, quantity) => {
    const response = await api.put('/carts', { cartId, quantity });
    return response;
  },

  /**
   * 장바구니 상품 삭제
   * DELETE /carts?cartId={cartId}
   */
  removeFromCart: async (cartId) => {
    const response = await api.delete('/carts', { params: { cartId } });
    return response;
  },

  /**
   * 장바구니 전체 삭제
   * DELETE /carts-all?memberId={memberId}
   */
  clearCart: async (memberId) => {
    const response = await api.delete('/carts-all', { params: { memberId } });
    return response;
  },

  // ===== 쿠폰 APIs =====
  
  /**
   * 사용자 쿠폰 목록 조회
   * GET /user-coupons/{memberId}
   */
  getCoupons: async (memberId) => {
    try {
      const response = await api.get(`/user-coupons/${memberId}`);
      return response;
    } catch (error) {
      console.error('쿠폰 조회 에러:', error);
      throw error;
    }
  },

  /**
   * 쿠폰 등록
   * POST /user-coupons
   */
  registerCoupon: async (memberId, couponDefinitionId) => {
    try {
      const response = await api.post('/user-coupons', {
        memberId,
        couponDefinitionId
      });
      return response;
    } catch (error) {
      console.error('쿠폰 등록 에러:', error);
      throw error;
    }
  },

  /**
   * 쿠폰 삭제
   * DELETE /user-coupons
   */
  deleteCoupon: async (userCouponId) => {
    try {
      const response = await api.delete('/user-coupons', {
        params: { userCouponId }
      });
      return response;
    } catch (error) {
      console.error('쿠폰 삭제 에러:', error);
      throw error;
    }
  },

  /**
   * 쿠폰 정의 목록 조회 (발급 가능한 쿠폰들)
   * GET /coupon-definition
   */
  getCouponDefinitions: async () => {
    try {
      const response = await api.get('/coupon-definition');
      return response;
    } catch (error) {
      console.error('쿠폰 정의 조회 에러:', error);
      // 403 에러는 권한 없음을 의미하므로 더 구체적인 에러 메시지 제공
      if (error.response?.status === 403) {
        throw new Error('쿠폰 조회 권한이 없습니다. 관리자에게 문의하세요.');
      }
      throw error;
    }
  },

  /**
   * 쿠폰 정의 생성 (관리자 전용)
   * POST /coupon-definition
   */
  createCouponDefinition: async (couponData) => {
    try {
      const response = await api.post('/coupon-definition', couponData);
      return response;
    } catch (error) {
      console.error('쿠폰 정의 생성 에러:', error);
      // 403 에러는 권한 없음을 의미
      if (error.response?.status === 403) {
        throw new Error('쿠폰 생성 권한이 없습니다. 관리자만 생성할 수 있습니다.');
      }
      throw new Error('쿠폰 생성 실패');
    }
  },

  // ===== 유틸리티 메서드 =====
  
  /**
   * 캐시 전체 삭제
   */
  clearAllCache: () => {
    ApiCache.clearAllCache();
  },

  /**
   * 서킷 브레이커 상태 확인
   */
  getSystemStatus: () => {
    // 현재 로컬 스토리지의 모든 'api_cache_' 키를 가져옵니다.
    const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('api_cache_'));
    let totalSize = 0;
    const cacheItems = cacheKeys.map(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsedItem = JSON.parse(item);
          // 실제 데이터 크기 추정 (JSON 문자열 길이로)
          const itemSize = new Blob([JSON.stringify(parsedItem.data)]).size;
          totalSize += itemSize;
          const expiresIn = Math.round((CACHE_EXPIRATION - (new Date().getTime() - parsedItem.timestamp)) / 60000) ; // 분 단위
          return {
            key: key.replace('api_cache_', ''),
            size: itemSize,
            expiresIn: expiresIn > 0 ? expiresIn : 0,
          };
        }
      } catch (e) {
        // 파싱 오류 등은 무시
      }
      return null;
    }).filter(item => item !== null);

    return {
      circuitBreaker: {
        status: circuitState.status,
        failures: circuitState.failures,
        // nextAttempt도 추가하면 유용할 수 있습니다.
        nextAttempt: circuitState.nextAttempt ? new Date(circuitState.nextAttempt).toISOString() : null,
      },
      cache: { // cache 객체 추가
        itemCount: cacheKeys.length,
        totalSize: totalSize, // 바이트 단위
        items: cacheItems, // 개별 캐시 항목에 대한 상세 정보 (선택적)
      },
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString() // App.jsx에서 사용하던 lastUpdated와 동일하게
    };
  },

  /**
   * 회원정보 업데이트
   * PUT /members/update
   */
  updateMember: async (memberData) => {
    try {
      const response = await api.put('/members/update', memberData);
      return response;
    } catch (error) {
      console.error('회원정보 업데이트 에러:', error);
      throw error;
    }
  },

  /**
   * 내 주문 목록 조회
   * GET /orders/my-order
   */
  getMyOrders: async (memberId) => {
    try {
      const response = await api.get('/orders/my-order', {
        params: { memberId }
      });
      return response;
    } catch (error) {
      console.error('주문 목록 조회 에러:', error);
      throw error;
    }
  },
};

// 카테고리 한글명 매핑 테이블
export const CATEGORY_KOR_MAP = {
  Clothes: '의류',
  Electronics: '전자제품',
  Furniture: '가구/인테리어',
  Shoes: '신발',
  Others: '기타',
  Miscellaneous: '잡화',
  Changed: '변경',
  // 필요시 추가
};

// 카테고리 한글명 매핑 함수
export function localizeCategories(categories) {
  return categories.map(cat => ({
    ...cat,
    koreanName: CATEGORY_KOR_MAP[cat.name] || cat.name,
  }));
}

export default ApiService; 