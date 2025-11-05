# 백엔드 연결 설정 가이드

## 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 백엔드 API 사용 여부
EXPO_PUBLIC_USE_BACKEND_API=true

# 백엔드 API 기본 URL
EXPO_PUBLIC_API_BASE_URL=https://your-backend-api.com

# (선택) OpenAI API 키 (백엔드 사용 시 불필요)
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
```

## 2. 백엔드 API 엔드포인트

### AI 조언 API
- **엔드포인트**: `POST /api/ai-advice`
- **설명**: 궁합 결과를 기반으로 AI 조언을 생성
- **자세한 내용**: `BACKEND_API_GUIDE.md` 참조

### 인증 API (추가 필요)
- **로그인**: `POST /api/auth/login`
- **회원가입**: `POST /api/auth/signup`
- **프로필 조회**: `GET /api/auth/profile`
- **프로필 업데이트**: `PUT /api/auth/profile`

## 3. 설정 완료 후

1. 앱을 재시작하세요:
   ```bash
   npm run start:clear
   ```

2. 백엔드 서버가 실행 중인지 확인하세요.

3. 브라우저 콘솔에서 API 호출을 확인하세요.

## 4. 문제 해결

- **CORS 오류**: 백엔드에서 CORS 설정 확인
- **연결 실패**: 백엔드 URL이 올바른지 확인
- **인증 오류**: 토큰이 올바르게 전달되는지 확인

