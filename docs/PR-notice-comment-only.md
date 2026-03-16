# Notice + Comment만 PR에 포함하기 (Notification 제외)

## 1. Notification 파일 unstage

```bash
git restore --staged src/modules/notification/notification.controller.ts
git restore --staged src/modules/notification/notification.repo.ts
git restore --staged src/modules/notification/notification.router.ts
git restore --staged src/modules/notification/notification.service.ts
```

## 2. 현재 상태 확인

```bash
git status
```

→ notification 파일들이 "Changes not staged" 또는 "Untracked"로 내려가면 됨

## 3. Notice + Comment 관련만 커밋

필요한 파일만 선택해서 add 후 커밋:

```bash
# Notice
git add src/modules/notice/

# Comment  
git add src/modules/comment/

# app.ts (notice, comment 라우터 등록)
git add src/app.ts
```

그 다음 팀 규칙에 따라 schema, migration, complaint 등은 포함 여부 결정.

## 4. PR 생성

```bash
git commit -m "feat: Notice, Comment 모듈 구현 (스키마 변경 반영)"
git push origin feat/auth단체승인
```

---

**참고**: Notice 생성 시 `createNoticeNotifications`는 notice.repo 안에 있어서 그대로 둬도 됨.  
Notification **API**(SSE, 읽음 처리 등)만 제외하는 것이고, 공지 등록 시 DB에 알림 레코드 생성은 유지됨.
