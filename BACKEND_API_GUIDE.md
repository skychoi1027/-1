# 백엔드 API 연동 가이드

## 개요

AI 조언 기능을 백엔드 API로 연동하는 방법을 안내합니다.

## 환경 변수 설정

`.env` 파일에 다음 변수를 추가하세요:

```env
# 백엔드 API 사용 여부
EXPO_PUBLIC_USE_BACKEND_API=true

# 백엔드 API 기본 URL
EXPO_PUBLIC_API_BASE_URL=https://your-backend-api.com

# (선택) OpenAI API 키 (백엔드 사용 시 불필요)
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
```

## 백엔드 API 엔드포인트 명세

### POST /api/ai-advice

AI 조언을 요청하는 엔드포인트입니다.

#### Request Headers

```
Content-Type: application/json
Authorization: Bearer {token}  // (선택) 인증이 필요한 경우
```

#### Request Body

```typescript
{
  score: number;              // 궁합 점수 (0-100)
  explanation: string;        // 점수 설명
  salAnalysis: Array<{        // 살 분석 결과
    type: string;             // 살 종류 (예: "충살", "형살")
    count: number;            // 살 개수
    description: string;      // 살 설명
  }>;
  user1: {
    name: string;            // 이용자1 이름
    gender: string;          // 이용자1 성별 ("남" 또는 "여")
    birthDate: string;       // 이용자1 생년월일 (YYYY-MM-DD)
    birthTime: string;       // 이용자1 생시 (HH:MM)
  };
  user2: {
    name: string;            // 이용자2 이름
    gender: string;          // 이용자2 성별 ("남" 또는 "여")
    birthDate: string;       // 이용자2 생년월일 (YYYY-MM-DD)
    birthTime: string;       // 이용자2 생시 (HH:MM)
  };
  saju1?: {                  // 이용자1 사주 (선택)
    year: { gan: string; ji: string };
    month: { gan: string; ji: string };
    day: { gan: string; ji: string };
    hour: { gan: string; ji: string };
  };
  saju2?: {                  // 이용자2 사주 (선택)
    year: { gan: string; ji: string };
    month: { gan: string; ji: string };
    day: { gan: string; ji: string };
    hour: { gan: string; ji: string };
  };
}
```

#### Response (성공)

```typescript
{
  success: true;
  data: {
    advice: string;          // 전체 조언 내용
    tips?: string[];         // 구체적인 팁 목록 (선택)
    summary?: string;        // 요약 (선택)
  };
}
```

#### Response (실패)

```typescript
{
  success: false;
  message: string;          // 오류 메시지
  error?: any;              // 상세 오류 정보 (선택)
}
```

## 백엔드 구현 예시

### Node.js + Express 예시

```javascript
const express = require('express');
const router = express.Router();

router.post('/api/ai-advice', async (req, res) => {
  try {
    const { score, explanation, salAnalysis, user1, user2, saju1, saju2 } = req.body;

    // 입력값 검증
    if (!score || !explanation) {
      return res.status(400).json({
        success: false,
        message: '필수 데이터가 누락되었습니다.',
      });
    }

    // OpenAI API 호출 (서버에서 API 키 사용)
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const prompt = generatePrompt({
      score,
      explanation,
      salAnalysis,
      user1,
      user2,
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '당신은 사주 팔자 전문가입니다. 궁합 결과를 분석하여 실용적이고 긍정적인 조언을 제공합니다.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 오류: ${response.status}`);
    }

    const data = await response.json();
    const advice = data.choices[0]?.message?.content || '';

    // 응답 파싱 및 반환
    const parsedResponse = parseAIResponse(advice);

    res.json({
      success: true,
      data: parsedResponse,
    });
  } catch (error) {
    console.error('AI 조언 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: 'AI 조언 생성 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
});

function generatePrompt(request) {
  // 프롬프트 생성 로직
  // (클라이언트와 동일한 로직 사용)
}

function parseAIResponse(response) {
  // 응답 파싱 로직
  // (클라이언트와 동일한 로직 사용)
}

module.exports = router;
```

### Python + FastAPI 예시

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import openai
import os

app = FastAPI()

class SalAnalysis(BaseModel):
    type: str
    count: int
    description: str

class UserData(BaseModel):
    name: str
    gender: str
    birthDate: str
    birthTime: str

class AIAdviceRequest(BaseModel):
    score: int
    explanation: str
    salAnalysis: List[SalAnalysis]
    user1: UserData
    user2: UserData
    saju1: Optional[dict] = None
    saju2: Optional[dict] = None

class AIAdviceResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    message: Optional[str] = None

@app.post("/api/ai-advice", response_model=AIAdviceResponse)
async def get_ai_advice(request: AIAdviceRequest):
    try:
        # OpenAI API 호출
        openai.api_key = os.getenv("OPENAI_API_KEY")
        
        prompt = generate_prompt(request.dict())
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "당신은 사주 팔자 전문가입니다. 궁합 결과를 분석하여 실용적이고 긍정적인 조언을 제공합니다."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        advice = response.choices[0].message.content
        
        # 응답 파싱
        parsed_response = parse_ai_response(advice)
        
        return {
            "success": True,
            "data": parsed_response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_prompt(request: dict) -> str:
    # 프롬프트 생성 로직
    pass

def parse_ai_response(response: str) -> dict:
    # 응답 파싱 로직
    pass
```

## 추가 기능 구현 가이드

### 1. 사용량 제한

```javascript
// 사용자별 일일 요청 횟수 제한
const userRequestCount = await getDailyRequestCount(userId);
if (userRequestCount >= MAX_DAILY_REQUESTS) {
  return res.status(429).json({
    success: false,
    message: '일일 요청 한도를 초과했습니다.',
  });
}
```

### 2. 결과 캐싱

```javascript
// 동일한 입력에 대한 결과 캐싱
const cacheKey = generateCacheKey(request);
const cachedResult = await redis.get(cacheKey);
if (cachedResult) {
  return res.json({
    success: true,
    data: JSON.parse(cachedResult),
    cached: true,
  });
}
```

### 3. 데이터베이스 저장

```javascript
// 결과를 데이터베이스에 저장
await db.aiAdviceHistory.create({
  userId,
  score,
  advice: parsedResponse.advice,
  createdAt: new Date(),
});
```

### 4. 로깅 및 분석

```javascript
// 요청 로깅
await db.apiLog.create({
  endpoint: '/api/ai-advice',
  userId,
  requestData: sanitizedRequest,
  responseTime: Date.now() - startTime,
  timestamp: new Date(),
});
```

## 보안 고려사항

1. **API 키 보호**: OpenAI API 키는 절대 클라이언트에 노출하지 않습니다.
2. **입력값 검증**: 모든 입력값을 서버에서 검증합니다.
3. **Rate Limiting**: 요청 횟수를 제한하여 악용을 방지합니다.
4. **CORS 설정**: 허용된 도메인에서만 요청을 받습니다.
5. **인증**: 필요시 JWT 토큰 등으로 사용자 인증을 구현합니다.

## 테스트

```bash
# API 테스트 예시
curl -X POST https://your-backend-api.com/api/ai-advice \
  -H "Content-Type: application/json" \
  -d '{
    "score": 75,
    "explanation": "무난한 궁합입니다.",
    "salAnalysis": [
      {"type": "충살", "count": 1, "description": "..."}
    ],
    "user1": {"name": "홍길동", "gender": "남", "birthDate": "1990-01-01", "birthTime": "12:00"},
    "user2": {"name": "김영희", "gender": "여", "birthDate": "1992-05-15", "birthTime": "14:30"}
  }'
```

