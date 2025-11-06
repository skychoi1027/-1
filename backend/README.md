# 궁합문어 백엔드 서버

Node.js + Express 기반 백엔드 서버입니다.

## 설치

### Node.js 의존성
```bash
npm install
```

### Python 의존성 (TensorFlow 모델 사용 시)
```bash
pip install -r requirements.txt
```

## 필요한 파일

백엔드 디렉토리에 다음 파일들이 있어야 합니다:
- `cal.csv` - 절기 정보 데이터
- `sky3000.h5` - 천간 계산용 TensorFlow 모델
- `earth3000.h5` - 지지 계산용 TensorFlow 모델
- `calculate.py` - Python 계산 스크립트

## 실행

```bash
npm start
```

또는 개발 모드 (nodemon 사용):
```bash
npm run dev
```

## API 엔드포인트

### POST /api/calculate-compatibility
사주 궁합 계산 (TensorFlow 모델 사용)

**요청:**
```json
{
  "person0": [1, 2, 3, 4, 5, 6],  // [년간, 년지, 월간, 월지, 일간, 일지]
  "person1": [7, 8, 9, 10, 11, 12],
  "gender0": 1,  // 1=남자, 0=여자
  "gender1": 0
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "originalScore": 100.0,
    "finalScore": 85.0,
    "sal0": [0, 0, 0, 0, 0, 0, 0, 0],
    "sal1": [0, 0, 0, 0, 0, 0, 0, 0]
  }
}
```

### POST /api/ai-advice
AI 조언 생성

### POST /api/auth/login
로그인

### POST /api/auth/signup
회원가입

### GET /api/auth/profile
프로필 조회

### PUT /api/auth/profile
프로필 업데이트

## 환경 변수

`.env` 파일에 다음 변수를 설정하세요:

```
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
```

## 주의사항

- Python이 설치되어 있어야 TensorFlow 모델을 사용할 수 있습니다.
- Python이 없거나 모델 파일이 없는 경우, 기본값(100점)을 반환합니다.
