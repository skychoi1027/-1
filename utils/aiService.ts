/**
 * AI 조언 서비스
 * - 궁합 결과를 기반으로 AI에게 조언을 요청
 * - OpenAI API 직접 호출 또는 백엔드 API 사용 가능
 * 
 * 백엔드 API 연동 방법:
 * 1. .env 파일에 다음 환경 변수 추가:
 *    EXPO_PUBLIC_USE_BACKEND_API=true
 *    EXPO_PUBLIC_API_BASE_URL=https://your-backend-api.com
 * 
 * 2. 백엔드 API 엔드포인트 예시:
 *    POST /api/ai-advice
 *    Request Body:
 *    {
 *      score: number,
 *      explanation: string,
 *      salAnalysis: Array<{type: string, count: number, description: string}>,
 *      user1: {name: string, gender: string, birthDate: string, birthTime: string},
 *      user2: {name: string, gender: string, birthDate: string, birthTime: string},
 *      saju1: {...},
 *      saju2: {...}
 *    }
 *    Response:
 *    {
 *      success: boolean,
 *      data: {
 *        advice: string,
 *        tips?: string[],
 *        summary?: string
 *      }
 *    }
 * 
 * 3. 백엔드에서 처리할 수 있는 작업:
 *    - API 키 보호 (OpenAI API 키를 서버에서 관리)
 *    - 사용량 제한 (사용자별 요청 횟수 제한)
 *    - 결과 캐싱 (동일한 결과에 대한 조언 재사용)
 *    - 로깅 및 분석 (사용 패턴 분석)
 *    - 데이터베이스 연동 (결과 저장, 히스토리 관리)
 */

import { UserData } from '@/contexts/UserDataContext';

/**
 * AI 조언 요청 파라미터
 */
interface AIAdviceRequest {
  score: number;
  explanation: string;
  salAnalysis: Array<{ type: string; count: number; description: string }>;
  user1: UserData;
  user2: UserData;
  saju1?: any;
  saju2?: any;
}

/**
 * AI 조언 응답
 */
export interface AIAdviceResponse {
  advice: string;
  tips?: string[];
  summary?: string;
}

/**
 * AI 조언 생성 (메인 함수)
 * 
 * 백엔드 API 연동 순서:
 * 1. 백엔드 API URL을 환경 변수로 설정: EXPO_PUBLIC_API_BASE_URL
 * 2. 아래 주석 처리된 백엔드 API 호출 코드를 활성화
 * 3. OpenAI 직접 호출 코드를 주석 처리
 * 
 * @param request 궁합 결과 데이터
 * @param apiKey OpenAI API 키 (환경 변수 또는 직접 입력) - 백엔드 사용 시 불필요
 * @returns AI 조언
 */
export async function getAIAdvice(
  request: AIAdviceRequest,
  apiKey?: string
): Promise<AIAdviceResponse> {
  // ============================================
  // 옵션 1: 백엔드 API 사용 (권장)
  // ============================================
  // 백엔드 API 사용 여부를 환경 변수로 제어
  const useBackendAPI = process.env.EXPO_PUBLIC_USE_BACKEND_API === 'true';
  const backendApiUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  if (useBackendAPI) {
    try {
      // 인증 토큰 가져오기
      let authToken: string | null = null;
      let userId: string | null = null;
      
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          authToken = window.localStorage.getItem('authToken');
          // userId는 토큰에서 추출하거나 별도로 저장된 값 사용
          // 현재는 토큰 형식이 'token-{userId}'이므로 추출
          if (authToken && authToken.startsWith('token-')) {
            userId = authToken.replace('token-', '');
          }
        }
      } catch (e) {
        console.log('localStorage not available');
      }

      // 백엔드 API 엔드포인트 호출
      // 예: POST /api/ai-advice
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // 인증 토큰이 있으면 헤더에 추가
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      // userId가 있으면 헤더에 추가 (백엔드에서 x-user-id 헤더 사용)
      if (userId) {
        headers['x-user-id'] = userId;
      }

      const response = await fetch(`${backendApiUrl}/api/ai-advice`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          // 궁합 결과 데이터 전송
          userId: userId || null,
          compatibilityResultId: (request as any).compatibilityResultId || null, // 옵셔널
          score: request.score,
          explanation: request.explanation,
          salAnalysis: request.salAnalysis,
          user1: {
            name: request.user1.name,
            gender: request.user1.gender,
            birthDate: request.user1.birthDate,
            birthTime: request.user1.birthTime,
          },
          user2: {
            name: request.user2.name,
            gender: request.user2.gender,
            birthDate: request.user2.birthDate,
            birthTime: request.user2.birthTime,
          },
          saju1: request.saju1,
          saju2: request.saju2,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`백엔드 API 오류: ${response.status} - ${errorData.message || '알 수 없는 오류'}`);
      }

      const data = await response.json();
      
      // 백엔드 응답 형식에 맞게 파싱
      // 예상 응답 형식:
      // {
      //   success: true,
      //   data: {
      //     advice: "조언 내용...",
      //     tips: ["팁1", "팁2"],
      //     summary: "요약..."
      //   }
      // }
      
      if (data.success && data.data) {
        return {
          advice: data.data.advice || '',
          tips: data.data.tips,
          summary: data.data.summary,
        };
      } else {
        throw new Error('백엔드 응답 형식 오류');
      }
    } catch (error) {
      console.error('백엔드 API 호출 실패:', error);
      // 백엔드 실패 시 기본 조언으로 폴백
      return getDefaultAdvice(request);
    }
  }

  // ============================================
  // 옵션 2: OpenAI API 직접 호출 (현재 활성화)
  // ============================================
  // API 키가 제공되지 않으면 환경 변수에서 가져오기
  const key = apiKey || process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  if (!key) {
    // API 키가 없으면 기본 조언 반환
    return getDefaultAdvice(request);
  }

  try {
    // 프롬프트 생성
    const prompt = generatePrompt(request);

    // OpenAI API 호출
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
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
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    const advice = data.choices[0]?.message?.content || '';

    // 응답 파싱
    return parseAIResponse(advice);
  } catch (error) {
    console.error('AI 조언 요청 실패:', error);
    // 오류 발생 시 기본 조언 반환
    return getDefaultAdvice(request);
  }
}

/**
 * 프롬프트 생성
 */
function generatePrompt(request: AIAdviceRequest): string {
  const { score, explanation, salAnalysis, user1, user2 } = request;

  let prompt = `다음 사주 궁합 결과를 분석하여 조언을 해주세요:\n\n`;
  prompt += `궁합 점수: ${score}점\n`;
  prompt += `설명: ${explanation}\n\n`;

  if (salAnalysis && salAnalysis.length > 0) {
    prompt += `감점 요소 (살):\n`;
    salAnalysis.forEach((sal) => {
      prompt += `- ${sal.type}: ${sal.count}개 (${sal.description})\n`;
    });
    prompt += '\n';
  }

  prompt += `이용자 정보:\n`;
  prompt += `- ${user1.name || '이용자1'} (${user1.gender || '성별 불명'})\n`;
  prompt += `- ${user2.name || '이용자2'} (${user2.gender || '성별 불명'})\n\n`;

  prompt += `위 정보를 바탕으로 다음과 같은 형식으로 조언을 제공해주세요:\n`;
  prompt += `1. 전체적인 궁합 평가 (2-3문장)\n`;
  prompt += `2. 관계 유지 및 개선을 위한 구체적인 조언 (3-5가지)\n`;
  prompt += `3. 주의해야 할 점 (있다면)\n\n`;
  prompt += `한글로 답변하고, 긍정적이면서도 현실적인 조언을 제공해주세요.`;

  return prompt;
}

/**
 * AI 응답 파싱
 */
function parseAIResponse(response: string): AIAdviceResponse {
  // 기본적으로 전체 응답을 advice로 사용
  let advice = response.trim();

  // 응답에서 팁 추출 시도 (번호나 불릿 포인트 기반)
  const tips: string[] = [];
  const lines = response.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    // 번호나 불릿 포인트로 시작하는 줄 찾기
    if (/^[0-9]+\.\s/.test(trimmed) || /^[-•]\s/.test(trimmed)) {
      const tip = trimmed.replace(/^[0-9]+\.\s/, '').replace(/^[-•]\s/, '').trim();
      if (tip.length > 0) {
        tips.push(tip);
      }
    }
  }

  // 요약 생성 (첫 2-3문장)
  const sentences = advice.split(/[.!?]\s+/);
  const summary = sentences.slice(0, 2).join('. ') + '.';

  return {
    advice,
    tips: tips.length > 0 ? tips : undefined,
    summary: summary.length < advice.length ? summary : undefined,
  };
}

/**
 * 기본 조언 (API 키가 없거나 오류 발생 시)
 */
function getDefaultAdvice(request: AIAdviceRequest): AIAdviceResponse {
  const { score, explanation, salAnalysis } = request;

  let advice = '';
  const tips: string[] = [];

  if (score >= 80) {
    advice = '매우 좋은 궁합입니다! 서로를 이해하고 존중하는 마음으로 관계를 발전시켜 나가시기 바랍니다.';
    tips.push('서로의 감정을 공유하고 소통하는 시간을 자주 가지세요.');
    tips.push('서로의 취미나 관심사를 존중하고 지지해주세요.');
    tips.push('작은 감사 표현도 자주 하시면 관계가 더욱 돈독해집니다.');
  } else if (score >= 60) {
    advice = '무난한 궁합입니다. 서로 노력하면 좋은 관계를 유지할 수 있습니다.';
    tips.push('서로의 차이점을 인정하고 이해하려는 노력을 기울이세요.');
    tips.push('갈등이 생겼을 때는 감정보다 사실에 집중하여 대화하세요.');
    tips.push('공통 관심사를 찾아 함께 즐기는 시간을 늘려보세요.');
  } else if (score >= 40) {
    advice = '보통의 궁합입니다. 서로 이해하고 양보하면 관계를 발전시킬 수 있습니다.';
    tips.push('서로의 말을 경청하고 상대방의 입장을 이해하려 노력하세요.');
    tips.push('작은 갈등이라도 미루지 말고 바로 해결하려는 자세가 중요합니다.');
    tips.push('서로의 시간과 공간을 존중하는 것이 필요합니다.');
  } else {
    advice = '주의가 필요한 궁합입니다. 하지만 서로의 차이를 인정하고 소통하면 개선할 수 있습니다.';
    tips.push('상대방을 비난하지 말고 자신의 감정을 표현하는 연습을 하세요.');
    tips.push('갈등 상황에서는 감정적 반응보다는 차분한 대화를 시도하세요.');
    tips.push('전문가의 도움을 받는 것도 좋은 방법입니다.');
  }

  if (salAnalysis && salAnalysis.length > 0) {
    const highSalCount = salAnalysis.filter((sal) => sal.count > 0).length;
    if (highSalCount > 0) {
      tips.push(`감점 요소가 ${highSalCount}개 발견되었습니다. 서로의 차이를 이해하고 보완하려는 노력이 필요합니다.`);
    }
  }

  return {
    advice,
    tips,
    summary: advice,
  };
}

/**
 * Gemini API를 사용한 AI 조언 (대안)
 */
export async function getAIAdviceGemini(
  request: AIAdviceRequest,
  apiKey?: string
): Promise<AIAdviceResponse> {
  const key = apiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!key) {
    return getDefaultAdvice(request);
  }

  try {
    const prompt = generatePrompt(request);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    const advice = data.candidates[0]?.content?.parts[0]?.text || '';

    return parseAIResponse(advice);
  } catch (error) {
    console.error('Gemini AI 조언 요청 실패:', error);
    return getDefaultAdvice(request);
  }
}

