## 1팀 - 위리브

https://www.notion.so/Welive-30c61538a9e281dc87a4c7b97fc9f446?source=copy_link

## 팀원 구성

김민혁 - 팀장
이현우 - 팀원
이주은 - 팀원

## 프로젝트 소개

- 제목: 위리브
- 소개: 주민들과 아파트 관리 단체를 위한 상호 관리 플랫폼
  🏢 아파트 관리의 모든 것을 하나의 플랫폼으로!
  입주민부터 슈퍼 어드민까지, 아파트 운영에 필요한 모든 기능을 손쉽게 관리해보세요.
  위리브는 입주민∙관리자∙슈퍼 어드민의 역할에 따라 맞춤형 기능을 제공하는 스마트 아파트 운영 시스템입니다.
  입주민 명부 관리, 민원 처리, 주민 투표, 공지사항 등록은 물론, 실시간 알림과 자동 승인 시스템까지 지원하여 복잡했던 아파트 관리 업무를 간편하고 효율적으로 바꿔드립니다. 지금 바로 스마트한 아파트 관리를 시작하세요! 🗳️📬
- 프로젝트 기간: 2026.03.19 ~ 2026.04.01

## 기술 스택

| 구분            | 사용 기술                                   |
| --------------- | ------------------------------------------- |
| 런타임          | Node.js                                     |
| 언어            | TypeScript                                  |
| 웹 프레임워크   | Express 5                                   |
| ORM · DB        | Prisma, PostgreSQL                          |
| 입력 검증       | Zod                                         |
| 인증            | JWT(jsonwebtoken), bcrypt, cookie 기반 토큰 |
| 파일 · 스토리지 | Multer(업로드), AWS SDK S3 · Presigned URL  |
| 기타            | CORS, dotenv, csv-parse(명부 등)            |
| 테스트          | Jest, Supertest                             |
| 빌드 · 개발     | tsc, tsc-alias, ts-node, nodemon            |

## 팀원별 구현 기능 상세

### 김민혁

- **Auth (인증)**
  - JWT·쿠키 기반 **로그인, 로그아웃, 액세스·리프레시 토큰 갱신** API 엔드포인트 구현
  - Prisma·bcrypt를 연동한 사용자 검증 및 토큰 발급·재발급 처리
- **User (사용자)**
  - 로그인 사용자 **프로필·비밀번호 변경** 등 사용자 도메인 API 구현
- **Resident (입주민·명부)**
  - 아파트별 **입주민 명부(등록·조회·수정·삭제, 파일 업로드 등)** 관련 API 구현
- **Apartment (아파트)**
  - 회원가입 시 단지 검색·목록, 관리자용 아파트 목록·상세 등 **Apartment 도메인** API 구현

### 이현우

- **Auth (가입 승인)**
  - **관리자·슈퍼관리자** 권한으로 **주민(Register) 가입 상태 승인·거절** 처리 API 구현
  - 다건 요청에 대한 **일괄 상태 변경** 등 가입 검토 플로우 API 구현
- **Notice (공지사항)**
  - 공지 **등록·목록·상세·수정·삭제**, 카테고리·검색·상단 고정 등 공지 API 구현
- **Comment (댓글)**
  - 민원·공지에 대한 **댓글 작성·수정·삭제** API 구현
- **Notification (알림)**
  - 알림 목록·읽음 처리 및 **SSE 등 실시간 알림** 관련 API 구현

### 이주은

- **Auth (회원가입)**
  - **입주민·관리자·슈퍼관리자** 유형별 **회원가입(신청) 요청** API 엔드포인트 구현
  - 아파트·명부 정보와 연계한 가입 검증 로직 처리
- **Complaint (민원)**
  - 민원 **등록·목록·상세·수정·삭제**, 공개 여부, **조회수** 처리 API 구현
- **Poll & Pollsvote (주민투표)**
  - 투표 **등록·목록·상세·수정·삭제** 및 **투표·취소(옵션 선택)** API 구현
- **Event (일정·캘린더)**
  - 아파트별 **공지·투표 일정** 조회 및 일정 수정 등 이벤트 API 구현
- **poll-scheduler**
  - 투표 상태를 기간에 맞게 갱신하는 **백그라운드 스케줄러** 및 **헬스 체크(ping)** API 구현

##파일 구조

백엔드(Express API) 기준 주요 디렉터리입니다. 도메인별로 `router` · `controller` · `service` · `repo` · `dto`(또는 `validate`)가 `src/modules/<도메인>/` 아래에 모입니다.

```
nb06-welive-team1/
├── prisma/
│   ├── schema.prisma          # DB 스키마
│   ├── seed.ts                # 개발용 시드 (선택)
│   └── migrations/            # Prisma 마이그레이션 이력
├── src/
│   ├── app.ts                 # Express 앱·라우트 마운트·서버 기동
│   ├── __tests__/             # Jest 통합·단위 테스트
│   ├── libs/                  # prisma, constants, cookies, error 등 공용
│   ├── middlewares/           # authenticate, validate, 에러 핸들러
│   ├── types/                 # Express 확장·공용 타입
│   └── modules/
│       ├── auth/              # 로그인·회원가입·가입 승인 등
│       ├── apartment/       # 아파트 목록·상세
│       ├── user/              # 사용자 프로필 등
│       ├── resident/        # 입주민 명부·파일 업로드
│       ├── notice/          # 공지사항
│       ├── complaint/       # 민원
│       ├── comment/         # 댓글(공지·민원)
│       ├── poll/            # 주민투표 게시
│       ├── pollsvote/       # 투표 참여·취소
│       ├── poll-scheduler/  # 투표 기간 상태 갱신·헬스 ping
│       ├── event/           # 캘린더(공지·투표 일정)
│       └── notification/    # 알림·SSE
├── uploads/                   # 로컬 업로드(프로필 등)
├── .github/workflows/       # CI·배포 워크플로 (있는 경우)
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## 구현 홈페이지

## 프로젝트 회고록
