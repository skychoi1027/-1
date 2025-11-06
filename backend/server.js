/**
 * 궁합문어 백엔드 서버
 * Node.js + Express
 */

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
require('dotenv').config();

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 파싱

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: '궁합문어 백엔드 서버가 실행 중입니다.' });
});

// AI 조언 API
app.post('/api/ai-advice', async (req, res) => {
  try {
    const { score, explanation, salAnalysis, user1, user2, saju1, saju2 } = req.body;

    // 입력값 검증
    if (score === undefined || !explanation) {
      return res.status(400).json({
        success: false,
        message: '필수 데이터가 누락되었습니다.',
      });
    }

    // OpenAI API 키 확인
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      // OpenAI API 키가 없으면 기본 조언 반환
      return res.json({
        success: true,
        data: {
          advice: getDefaultAdvice(score, explanation, salAnalysis),
          tips: getDefaultTips(score),
          summary: `궁합 점수 ${score}점입니다.`,
        },
      });
    }

    // OpenAI API 호출
    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: openaiApiKey });

    const prompt = generatePrompt({ score, explanation, salAnalysis, user1, user2 });

    const response = await openai.chat.completions.create({
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
    });

    const advice = response.choices[0]?.message?.content || '';

    // 응답 파싱
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

// 인증 API (예시)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // TODO: 실제 데이터베이스에서 사용자 확인
    // 예시: 간단한 체크
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 입력해주세요.',
      });
    }

    // TODO: 실제 인증 로직 구현
    // 예시: 임시로 성공 처리
    res.json({
      success: true,
      token: 'jwt-token-here', // 실제로는 JWT 토큰 생성
      user: {
        id: 'user-1',
        email,
        name: email.split('@')[0],
      },
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '로그인 중 오류가 발생했습니다.',
    });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // TODO: 실제 데이터베이스에 사용자 저장
    // 예시: 임시로 성공 처리
    res.json({
      success: true,
      token: 'jwt-token-here',
      user: {
        id: 'user-1',
        email,
        name: name || email.split('@')[0],
      },
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({
      success: false,
      message: '회원가입 중 오류가 발생했습니다.',
    });
  }
});

app.get('/api/auth/profile', async (req, res) => {
  try {
    // TODO: 실제 인증 토큰 확인
    // TODO: 실제 데이터베이스에서 프로필 조회
    res.json({
      success: true,
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: '사용자',
      },
    });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '프로필 조회 중 오류가 발생했습니다.',
    });
  }
});

app.put('/api/auth/profile', async (req, res) => {
  try {
    const { name, birthDate, birthTime, gender } = req.body;

    // TODO: 실제 인증 토큰 확인
    // TODO: 실제 데이터베이스에 프로필 업데이트
    res.json({
      success: true,
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name,
        profile: {
          name,
          birthDate,
          birthTime,
          gender,
        },
      },
    });
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '프로필 업데이트 중 오류가 발생했습니다.',
    });
  }
});

// 사주 궁합 계산 API (Python TensorFlow 모델 사용)
app.post('/api/calculate-compatibility', async (req, res) => {
  try {
    const { person0, person1, gender0, gender1 } = req.body;

    // 입력값 검증
    if (!person0 || !person1 || !Array.isArray(person0) || !Array.isArray(person1)) {
      return res.status(400).json({
        success: false,
        message: 'person0와 person1 배열이 필요합니다.',
      });
    }

    if (person0.length !== 6 || person1.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'person0와 person1은 각각 6개의 요소(년간, 년지, 월간, 월지, 일간, 일지)를 가져야 합니다.',
      });
    }

    // Python 스크립트에 전달할 데이터 준비
    const inputData = {
      person0: person0, // [년간, 년지, 월간, 월지, 일간, 일지]
      person1: person1,
      gender0: gender0 === '남자' || gender0 === 'male' || gender0 === 1 ? 1 : 0,
      gender1: gender1 === '남자' || gender1 === 'male' || gender1 === 1 ? 1 : 0,
    };

    // Python 스크립트 경로
    const pythonScriptPath = path.join(__dirname, 'calculate.py');
    
    // Windows와 Linux/Mac 모두 지원
    const isWindows = process.platform === 'win32';
    const pythonCommand = isWindows ? 'python' : 'python3';
    
    // Python 스크립트 실행
    try {
      // JSON 데이터를 파일로 전달 (echo는 Windows에서 문제가 있을 수 있음)
      const inputJson = JSON.stringify(inputData);
      const command = isWindows
        ? `echo ${inputJson} | ${pythonCommand} "${pythonScriptPath}"`
        : `echo '${inputJson}' | ${pythonCommand} "${pythonScriptPath}"`;
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: __dirname, // 백엔드 디렉토리에서 실행 (모델 파일 위치)
        maxBuffer: 10 * 1024 * 1024, // 10MB 버퍼
        shell: true, // Windows에서도 동작하도록
      });

      if (stderr && !stderr.includes('WARNING')) {
        console.error('Python 스크립트 오류:', stderr);
      }

      // Python 출력 파싱
      const result = JSON.parse(stdout.trim());

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error || '계산 중 오류가 발생했습니다.',
        });
      }

      // 성공 응답
      res.json({
        success: true,
        data: result.data,
      });
    } catch (execError) {
      console.error('Python 실행 오류:', execError);
      
      // Python이 설치되지 않았거나 모델 파일이 없는 경우 기본값 반환
      return res.json({
        success: true,
        data: {
          originalScore: 100,
          finalScore: 100,
          sal0: [0, 0, 0, 0, 0, 0, 0, 0],
          sal1: [0, 0, 0, 0, 0, 0, 0, 0],
          fallback: true, // 기본값 사용 표시
        },
      });
    }
  } catch (error) {
    console.error('궁합 계산 오류:', error);
    res.status(500).json({
      success: false,
      message: '궁합 계산 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
});

// 프롬프트 생성 함수
function generatePrompt({ score, explanation, salAnalysis, user1, user2 }) {
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
  prompt += `- ${user1?.name || '이용자1'} (${user1?.gender || '성별 불명'})\n`;
  prompt += `- ${user2?.name || '이용자2'} (${user2?.gender || '성별 불명'})\n\n`;

  prompt += `위 정보를 바탕으로 다음과 같은 형식으로 조언을 제공해주세요:\n`;
  prompt += `1. 전체적인 궁합 평가 (2-3문장)\n`;
  prompt += `2. 관계 유지 및 개선을 위한 구체적인 조언 (3-5가지)\n`;
  prompt += `3. 주의해야 할 점 (있다면)\n\n`;
  prompt += `한글로 답변하고, 긍정적이면서도 현실적인 조언을 제공해주세요.`;

  return prompt;
}

// AI 응답 파싱 함수
function parseAIResponse(response) {
  let advice = response.trim();
  const tips = [];
  const lines = response.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[0-9]+\.\s/.test(trimmed) || /^[-•]\s/.test(trimmed)) {
      const tip = trimmed.replace(/^[0-9]+\.\s/, '').replace(/^[-•]\s/, '').trim();
      if (tip.length > 0) {
        tips.push(tip);
      }
    }
  }

  const sentences = advice.split(/[.!?]\s+/);
  const summary = sentences.slice(0, 2).join('. ') + '.';

  return {
    advice,
    tips: tips.length > 0 ? tips : undefined,
    summary: summary.length < advice.length ? summary : undefined,
  };
}

// 기본 조언 함수
function getDefaultAdvice(score, explanation, salAnalysis) {
  if (score >= 80) {
    return '매우 좋은 궁합입니다! 서로를 이해하고 존중하는 마음으로 관계를 발전시켜 나가시기 바랍니다.';
  } else if (score >= 60) {
    return '무난한 궁합입니다. 서로 노력하면 좋은 관계를 유지할 수 있습니다.';
  } else if (score >= 40) {
    return '보통의 궁합입니다. 서로 이해하고 양보하면 관계를 발전시킬 수 있습니다.';
  } else {
    return '주의가 필요한 궁합입니다. 하지만 서로의 차이를 인정하고 소통하면 개선할 수 있습니다.';
  }
}

// 기본 팁 함수
function getDefaultTips(score) {
  if (score >= 80) {
    return [
      '서로의 감정을 공유하고 소통하는 시간을 자주 가지세요.',
      '서로의 취미나 관심사를 존중하고 지지해주세요.',
      '작은 감사 표현도 자주 하시면 관계가 더욱 돈독해집니다.',
    ];
  } else if (score >= 60) {
    return [
      '서로의 차이점을 인정하고 이해하려는 노력을 기울이세요.',
      '갈등이 생겼을 때는 감정보다 사실에 집중하여 대화하세요.',
      '공통 관심사를 찾아 함께 즐기는 시간을 늘려보세요.',
    ];
  } else {
    return [
      '서로의 말을 경청하고 상대방의 입장을 이해하려 노력하세요.',
      '작은 갈등이라도 미루지 말고 바로 해결하려는 자세가 중요합니다.',
      '서로의 시간과 공간을 존중하는 것이 필요합니다.',
    ];
  }
}

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`📝 환경 변수 확인:`);
  console.log(`   - OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '설정됨' : '설정 안 됨 (기본 조언 사용)'}`);
});

