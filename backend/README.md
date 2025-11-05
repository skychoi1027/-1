# 궁합문어 백엔드 서버

Node.js + Express로 구현된 백엔드 서버입니다.

## 설치 및 실행

### 1. 의존성 설치

```bash
cd backend
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 설정하세요:

```bash
cp .env.example .env
```

`.env` 파일 편집:
```env
PORT=3000
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3. 서버 실행

```bash
# 일반 실행
npm start

# 개발 모드 (자동 재시작)
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

## API 엔드포인트

### AI 조언
- `POST /api/ai-advice` - AI 조언 요청

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/signup` - 회원가입
- `GET /api/auth/profile` - 프로필 조회
- `PUT /api/auth/profile` - 프로필 업데이트

## 프론트엔드 연결

프론트엔드의 `.env` 파일에 다음을 추가하세요:

```env
EXPO_PUBLIC_USE_BACKEND_API=true
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

## 참고사항

- 현재는 예시 구현입니다
- 실제 프로덕션에서는 데이터베이스 연동, 인증 (JWT), 보안 강화가 필요합니다
- OpenAI API 키가 없어도 기본 조언이 제공됩니다

