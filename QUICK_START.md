# 빠른 연결 가이드 (3단계)

## 🚀 3단계로 연결하기

### 1️⃣ 백엔드 서버 실행 (첫 번째 터미널)

```bash
# backend 폴더로 이동
cd backend

# 패키지 설치 (처음 한 번만)
npm install

# 서버 실행
npm start
```

서버가 실행되면 다음 메시지가 보입니다:
```
🚀 백엔드 서버가 http://localhost:3000 에서 실행 중입니다.
```

**이 터미널은 계속 실행 상태로 두세요!**

---

### 2️⃣ 프론트엔드 환경 변수 설정

프로젝트 루트에 `.env` 파일을 만들고 다음 내용을 추가:

```env
EXPO_PUBLIC_USE_BACKEND_API=true
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

**파일 위치**: `C:\Users\skypo\SajuMonooApp\.env`

---

### 3️⃣ 프론트엔드 앱 재시작 (두 번째 터미널)

새 터미널 창을 열고:

```bash
# 프로젝트 루트로 이동
cd C:\Users\skypo\SajuMonooApp

# 캐시 지우고 재시작
npm run start:clear
```

또는 웹의 경우:
```bash
npm run web:clear
```

---

## ✅ 연결 확인

1. 브라우저에서 앱 열기
2. 개발자 도구 (F12) → Console 탭 열기
3. 로그인이나 AI 조언 버튼 클릭
4. 백엔드 서버 터미널에서 요청 로그 확인

성공하면 백엔드 서버 터미널에 요청이 표시됩니다!

---

## ⚠️ 문제 해결

**"포트 3000이 사용 중"**
- 다른 포트 사용: `backend/.env`에서 `PORT=3001`로 변경
- 프론트엔드 `.env`도 `http://localhost:3001`로 변경

**"환경 변수가 적용 안 됨"**
- Expo 앱 완전히 종료 후 다시 시작
- `.env` 파일이 프로젝트 루트에 있는지 확인

