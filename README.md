# Store Application

온라인 스토어 애플리케이션으로 프론트엔드(React)와 백엔드(Spring Boot)로 구성되어 있습니다.

## 프로젝트 구조

```
store/
├── front/                 # React + Vite 프론트엔드
├── store_backend/         # Spring Boot 백엔드
│   └── docker/           # 백엔드 Docker 설정
├── docker-compose.yml     # 통합 Docker Compose 설정
├── .env                  # 환경변수 설정 (생성 필요)
└── README.md
```

## 기술 스택

### 프론트엔드
- **React 19** with Vite
- **Material-UI (MUI)** for UI components
- **Redux Toolkit** for state management
- **Axios** for API calls
- **React Router** for navigation

### 백엔드
- **Spring Boot 2.7.2** with Java 17
- **Spring Security** with JWT authentication
- **Spring Data JPA** with QueryDSL
- **MySQL 5.7** database
- **Swagger** for API documentation

## 실행 방법

### Docker Compose를 사용한 실행 (권장)

1. 프로젝트 루트에 `.env` 파일 생성:
```bash
# MySQL 설정
MYSQL_ROOT_PASSWORD=rootpassword

# JWT 설정
JWT_SECRET=TaeWooTaeWooSecretKeyForJWT
JWT_EXPIRES=86400000
```

2. Docker Compose 실행:
```bash
docker-compose up --build
```

3. 서비스 접근:
   - 프론트엔드: http://localhost
   - 백엔드 API: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger-ui.html
   - MySQL: localhost:3306

### 개별 실행

#### 프론트엔드
```bash
cd front
npm install
npm run dev
```

#### 백엔드
```bash
cd store_backend
./gradlew bootRun
```

## 환경 설정

### 데이터베이스
- **Host**: mysql (Docker Compose 사용 시) / localhost (개별 실행 시)
- **Port**: 3306
- **Database**: ddd_start
- **Username**: root
- **Password**: `.env` 파일의 `MYSQL_ROOT_PASSWORD` 값

### JWT 설정
- **Secret Key**: `.env` 파일의 `JWT_SECRET` 값
- **Expires**: `.env` 파일의 `JWT_EXPIRES` 값 (밀리초)

## Docker Services

- **frontend**: React 애플리케이션 (포트 80)
- **backend**: Spring Boot API 서버 (포트 8080)
- **mysql**: MySQL 5.7 데이터베이스 (포트 3306)

## 개발 환경

### 필수 요구사항
- Docker & Docker Compose
- Node.js 18+ (로컬 개발 시)
- Java 17+ (로컬 개발 시)

### Mac M1/M2 사용자
- MySQL 컨테이너에 `platform: linux/amd64` 설정이 포함되어 있어 호환성 문제가 해결됩니다.

### API 문서
백엔드 서버 실행 후 Swagger UI에서 API 문서를 확인할 수 있습니다:
http://localhost:8080/swagger-ui.html

## 주요 기능
- 사용자 인증 (JWT)
- 상품 관리
- 주문 처리
- 카테고리 관리
- 쿠폰 시스템
- 고객 관리

## 트러블슈팅

### MySQL 연결 문제
- `.env` 파일이 올바르게 설정되었는지 확인
- MySQL 컨테이너가 완전히 시작될 때까지 대기 (healthcheck 포함)

### 포트 충돌
- 기본 포트: 80 (프론트), 8080 (백엔드), 3306 (MySQL)
- 필요시 docker-compose.yml에서 포트 변경 가능 