# Postman으로 API 테스트하기

## 1. 준비

1. **서버 실행**
   ```bash
   npm run dev
   ```
   → `http://localhost:3000` 에서 서버가 떠 있어야 합니다.

2. **테스트 계정** (시드 데이터가 있다면)
   - username: `testnotice`
   - password: `test1234`
   
   시드가 없다면 `scripts/seed-test-data.ts` 를 먼저 실행하세요.

## 2. Postman에서 컬렉션 가져오기

1. Postman 실행
2. **Import** → `postman/WeLive-API.postman_collection.json` 선택
3. "WeLive API - Notice & Comment" 컬렉션이 생성됨

## 3. 테스트 순서

### ① 로그인 (필수)

**1. Auth → 로그인 (먼저 실행)** 요청을 보냅니다.

- 응답에 `boardIds.NOTICE` 가 있으면 `boardId` 변수에 자동 저장됩니다.
- **쿠키**가 자동으로 저장되므로, 이후 Notice/Comment 요청에 인증이 적용됩니다.

### ② Notice 테스트

- **공지 목록 조회** → GET
- **공지 등록** → POST (boardId는 로그인 시 자동 저장됨)
- **공지 상세 조회** → GET (상세에서 받은 `noticeId`로 수정/삭제)
- **공지 수정** → PATCH
- **공지 삭제** → DELETE

### ③ Comment 테스트

- **댓글 등록 (NOTICE)** → POST
- **댓글 수정** → PATCH
- **댓글 삭제** → DELETE

## 4. 주의사항

- **쿠키**: 로그인 후 Postman이 쿠키를 자동 저장합니다.  
  다른 도메인/포트로 테스트하려면 Cookies를 다시 설정해야 할 수 있습니다.
- **boardId**: 로그인 응답의 `boardIds.NOTICE` 가 있으면 컬렉션 변수에 저장됩니다.  
  없으면 수동으로 입력하세요.
- **noticeId, commentId**: 등록/수정/삭제 시 응답에서 받은 ID를 URL에 넣어 사용하세요.

## 5. category 값 (Notice용)

- `MAINTENANCE` - 유지보수
- `EMERGENCY` - 긴급
- `COMMUNITY` - 커뮤니티
- `RESIDENT_VOTE` - 주민 투표
- `RESIDENT_COUNCIL` - 주민 대회
- `ETC` - 기타
