# 프론트엔드와 백엔드 연결 가이드

## 단계별 연결 방법

### 1단계: 백엔드 서버 설정 및 실행

#### 1-1. 백엔드 폴더로 이동
```bash
cd backend
```

#### 1-2. 패키지 설치
```bash
npm install
```

#### 1-3. 환경 변수 설정
`backend` 폴더에 `.env` 파일을 생성하고:
```env
PORT=3000
OPENAI_API_KEY=sk-your-key-here
```
(OpenAI API 키는 선택사항입니다. 없으면 기본 조언을 사용합니다)

#### 1-4. 백엔드 서버 실행
```bash
npm start
```

서버가 실행되면 다음과 같은 메시지가 표시됩니다:
```
🚀 백엔드 서버가 http://localhost:3000 에서 실행 중입니다.
```

**⚠️ 백엔드 서버를 계속 실행한 상태로 두세요!**

---

### 2단계: 프론트엔드 환경 변수 설정

#### 2-1. 프로젝트 루트로 이동
새 터미널 창을 열고 (백엔드 서버는 계속 실행 중):
```bash
cd C:\Users\skypo\SajuMonooApp
```

#### 2-2. .env 파일 생성
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가:

```env
# 백엔드 API 사용 여부
EXPO_PUBLIC_USE_BACKEND_API=true

# 백엔드 API 기본 URL
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# (선택) OpenAI API 키 (백엔드 사용 시 불필요)
# EXPO_PUBLIC_OPENAI_API_KEY=sk-...
```

**중요**: 
- `EXPO_PUBLIC_USE_BACKEND_API=true`로 설정해야 백엔드를 사용합니다
- `EXPO_PUBLIC_API_BASE_URL`은 백엔드 서버 주소를 입력하세요

---

### 3단계: 프론트엔드 앱 재시작

#### 3-1. 기존 Expo 서버 중지
현재 실행 중인 Expo 서버가 있다면 `Ctrl+C`로 중지

#### 3-2. 캐시 지우고 재시작
```bash
npm run start:clear
```

또는 웹의 경우:
```bash
npm run web:clear
```

---

### 4단계: 연결 확인

#### 4-1. 브라우저 콘솔 확인
- 웹 브라우저에서 개발자 도구 열기 (F12)
- Console 탭에서 API 호출 로그 확인
- 에러가 없으면 연결 성공!

#### 4-2. 기능 테스트
1. 로그인/회원가입 시도
2. AI 조언 받기 버튼 클릭
3. 백엔드 서버 터미널에서 요청 로그 확인

---

## 문제 해결

### 백엔드 서버가 실행되지 않을 때

**에러: "포트 3000이 이미 사용 중"**
```bash
# 다른 포트 사용
# backend/.env 파일에서:
PORT=3001

# 그리고 프론트엔드 .env에서:
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
```

**에러: "npm install 실패"**
```bash
# Node.js 버전 확인 (18 이상 권장)
node --version

# node_modules 삭제 후 재설치
cd backend
rm -rf node_modules
npm install
```

### 프론트엔드에서 연결 실패

**CORS 오류**
- 백엔드 서버에서 CORS가 이미 설정되어 있습니다
- 그래도 오류가 나면 `backend/server.js`의 `app.use(cors())` 확인

**연결 거부 오류**
- 백엔드 서버가 실행 중인지 확인
- `EXPO_PUBLIC_API_BASE_URL`이 올바른지 확인
- 방화벽이 포트를 막고 있지 않은지 확인

**환경 변수가 적용 안 됨**
- Expo 앱을 완전히 재시작 (종료 후 다시 시작)
- `.env` 파일이 프로젝트 루트에 있는지 확인
- 변수 이름이 `EXPO_PUBLIC_`로 시작하는지 확인

---

## 빠른 체크리스트

연결이 안 될 때 확인사항:

- [ ] 백엔드 서버가 실행 중인가? (`http://localhost:3000` 접속 테스트)
- [ ] 프론트엔드 `.env` 파일에 `EXPO_PUBLIC_USE_BACKEND_API=true`가 있는가?
- [ ] `EXPO_PUBLIC_API_BASE_URL`이 올바른가?
- [ ] Expo 앱을 재시작했는가?
- [ ] 두 터미널이 모두 올바른 폴더에서 실행 중인가?

---

## 완료!

연결이 성공하면:
- 로그인/회원가입이 백엔드 서버를 통해 처리됩니다
- AI 조언이 백엔드 서버를 통해 생성됩니다
- 백엔드 서버 터미널에서 요청 로그를 확인할 수 있습니다

