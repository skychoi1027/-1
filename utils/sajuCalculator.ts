/**
 * 사주 팔자 계산 유틸리티
 * 생년월일시를 기반으로 사주를 계산하고 궁합을 분석합니다.
 */

import { compatibilityAPI } from './apiClient';

// 천간 (10개)
const GAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
// 지지 (12개)
const JI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
// 오행 매핑
const ELEMENT_MAP: { [key: string]: string } = {
  '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토',
  '기': '토', '경': '금', '신': '금', '임': '수', '계': '수',
  '인': '목', '묘': '목', '사': '화', '오': '화', '진': '토', '술': '토',
  '축': '토', '미': '토', '신': '금', '유': '금', '해': '수', '자': '수',
};

// 오행 상생/상극 관계
const ELEMENT_RELATIONS = {
  상생: { // 생성 관계
    '목': '화',
    '화': '토',
    '토': '금',
    '금': '수',
    '수': '목',
  },
  상극: { // 극제 관계
    '목': '토',
    '화': '금',
    '토': '수',
    '금': '목',
    '수': '화',
  },
};

// 십이지충 (충돌 관계)
const CHUNG_RELATIONS: { [key: string]: string } = {
  '자': '오', '축': '미', '인': '신', '묘': '유',
  '진': '술', '사': '해', '오': '자', '미': '축',
  '신': '인', '유': '묘', '술': '진', '해': '사',
};

// 십이지형 (형벌 관계)
const HYEONG_RELATIONS: { [key: string]: string[] } = {
  '자': ['묘'],
  '축': ['진', '술', '미'],
  '인': ['사', '신'],
  '묘': ['자'],
  '진': ['축', '술', '미'],
  '사': ['인', '신'],
  '오': ['오'],
  '미': ['축', '진', '술'],
  '신': ['인', '사'],
  '유': ['유'],
  '술': ['축', '진', '미'],
  '해': ['해'],
};

// 십이지파 (파괴 관계)
const PA_RELATIONS: { [key: string]: string } = {
  '자': '유', '축': '신', '인': '해', '묘': '오',
  '진': '묘', '사': '자', '오': '묘', '미': '축',
  '신': '축', '유': '자', '술': '진', '해': '인',
};

// 십이지해 (해로움 관계)
const HAE_RELATIONS: { [key: string]: string } = {
  '자': '해', '축': '신', '인': '사', '묘': '진',
  '진': '묘', '사': '인', '오': '자', '미': '축',
  '신': '축', '유': '오', '술': '해', '해': '자',
};

/**
 * 사주 타입 정의
 * - 년주, 월주, 일주, 시주로 구성
 * - 각 주는 천간(gan)과 지지(ji)로 구성
 */
export interface Saju {
  year: { gan: string; ji: string };   // 년주 (생년)
  month: { gan: string; ji: string };  // 월주 (생월)
  day: { gan: string; ji: string };    // 일주 (생일)
  hour: { gan: string; ji: string };  // 시주 (생시)
}

/**
 * 살 분석 결과 타입
 */
export interface SalAnalysis {
  type: string;        // 살의 종류 (예: '충살', '형살')
  count: number;       // 살의 개수 (감점 요소)
  description: string; // 살에 대한 설명
}

/**
 * 양력 년도를 간지 년도로 변환
 */
function getGanjiYear(year: number): { gan: string; ji: string } {
  // 1984년이 갑자년 (기준)
  const baseYear = 1984;
  const offset = (year - baseYear) % 60;
  const ganIndex = offset % 10;
  const jiIndex = offset % 12;
  return { gan: GAN[ganIndex], ji: JI[jiIndex] };
}

/**
 * 월의 지지 계산 (절기 기준 간략화)
 */
function getGanjiMonth(year: number, month: number): { gan: string; ji: string } {
  const monthJi = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];
  const ji = monthJi[month - 1];
  
  // 년간에 따른 월간 계산
  const yearGan = getGanjiYear(year).gan;
  const yearGanIndex = GAN.indexOf(yearGan);
  
  // 월간 계산 공식
  const monthGanIndex = (yearGanIndex * 2 + month) % 10;
  const gan = GAN[monthGanIndex];
  
  return { gan, ji };
}

/**
 * 일주 계산 (간략화된 알고리즘)
 */
function getGanjiDay(year: number, month: number, day: number): { gan: string; ji: string } {
  // 1900년 1월 1일을 기준으로 계산
  const baseDate = new Date(1900, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const ganIndex = diffDays % 10;
  const jiIndex = diffDays % 12;
  
  return { gan: GAN[ganIndex], ji: JI[jiIndex] };
}

/**
 * 시주 계산 (일간에 따라 시간 결정)
 * - 일간(일주 천간)에 따라 시간이 결정됨
 * - 시간에 따라 시지 결정
 */
function getGanjiHour(dayGan: string, hour: number): { gan: string; ji: string } {
  const hourJi = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  const hourIndex = Math.floor((hour + 1) / 2) % 12;
  const ji = hourJi[hourIndex];
  
  // 일간에 따른 시간 계산
  const dayGanIndex = GAN.indexOf(dayGan);
  const hourGanIndex = (dayGanIndex * 2 + hourIndex) % 10;
  const gan = GAN[hourGanIndex];
  
  return { gan, ji };
}

/**
 * 생년월일시로 사주 계산
 * - 양력 날짜를 간지(干支)로 변환
 * - 년주, 월주, 일주, 시주 계산
 * @param year 년도 (1900-2100)
 * @param month 월 (1-12)
 * @param day 일 (1-31)
 * @param hour 시 (0-23, 기본값: 12)
 * @returns 계산된 사주 (년주, 월주, 일주, 시주)
 */
export function calculateSaju(
  year: number,
  month: number,
  day: number,
  hour: number = 12
): Saju {
  const yearGanji = getGanjiYear(year);
  const monthGanji = getGanjiMonth(year, month);
  const dayGanji = getGanjiDay(year, month, day);
  const hourGanji = getGanjiHour(dayGanji.gan, hour);
  
  return {
    year: yearGanji,
    month: monthGanji,
    day: dayGanji,
    hour: hourGanji,
  };
}

/**
 * 사주에서 모든 지지 추출 함수 - 제거됨
 * 백엔드 API에서 계산하므로 더 이상 사용되지 않습니다.
 * 
 * @deprecated 백엔드 API를 사용하세요.
 */
// function getAllJi - 제거됨

/**
 * 지지를 숫자로 변환 (1-12)
 */
function jiToNumber(ji: string): number {
  const jiMap: { [key: string]: number } = {
    '자': 1, '축': 2, '인': 3, '묘': 4, '진': 5, '사': 6,
    '오': 7, '미': 8, '신': 9, '유': 10, '술': 11, '해': 12,
  };
  return jiMap[ji] || 0;
}

/**
 * 천간을 숫자로 변환 (1-10)
 */
function ganToNumber(gan: string): number {
  const ganMap: { [key: string]: number } = {
    '갑': 1, '을': 2, '병': 3, '정': 4, '무': 5,
    '기': 6, '경': 7, '신': 8, '임': 9, '계': 10,
  };
  return ganMap[gan] || 0;
}

/**
 * 살(煞) 분석 함수 - 제거됨
 * 백엔드 API에서 계산하므로 더 이상 사용되지 않습니다.
 * 
 * @deprecated 백엔드 API를 사용하세요.
 */
// analyzeSal 함수는 백엔드 API로 대체되었습니다.

/**
 * 오행 분석 함수 - 제거됨
 * 백엔드 API에서 계산하므로 더 이상 사용되지 않습니다.
 * 
 * @deprecated 백엔드 API를 사용하세요.
 */
// function analyzeElement - 제거됨

/**
 * 이름의 획수 계산 함수 - 제거됨
 * 백엔드 API에서 계산하므로 더 이상 사용되지 않습니다.
 * 
 * @deprecated 백엔드 API를 사용하세요.
 */
// function calculateNameStrokes - 제거됨

/**
 * 이름의 음양오행 계산 함수 - 제거됨
 * 백엔드 API에서 계산하므로 더 이상 사용되지 않습니다.
 * 
 * @deprecated 백엔드 API를 사용하세요.
 */
// function getNameElement - 제거됨

/**
 * 성별 조합 점수 계산 함수 - 제거됨
 * 백엔드 API에서 계산하므로 더 이상 사용되지 않습니다.
 * 
 * @deprecated 백엔드 API를 사용하세요.
 */
// function calculateGenderCompatibility - 제거됨

/**
 * 일간과 성별의 음양 조화 계산 함수 - 제거됨
 * 백엔드 API에서 계산하므로 더 이상 사용되지 않습니다.
 * 
 * @deprecated 백엔드 API를 사용하세요.
 */
// function calculateYinYangHarmony - 제거됨

/**
 * 궁합 점수 계산 (메인 함수)
 * - 두 사람의 생년월일, 이름, 성별을 기반으로 궁합 점수 계산
 * - 백엔드 API를 통해 TensorFlow 모델을 사용하여 계산
 * - 시간은 사용하지 않음 (기본값 12시 사용)
 * - 이름은 백엔드로 전달하지 않지만 UI 표시용으로 유지
 * 
 * @param birthDate1 첫 번째 사람의 생년월일 (YYYY-MM-DD)
 * @param birthTime1 첫 번째 사람의 생시 (HH:MM) - 사용하지 않음
 * @param birthDate2 두 번째 사람의 생년월일 (YYYY-MM-DD)
 * @param birthTime2 두 번째 사람의 생시 (HH:MM) - 사용하지 않음
 * @param name1 첫 번째 사람의 이름 (한글) - UI 표시용
 * @param name2 두 번째 사람의 이름 (한글) - UI 표시용
 * @param gender1 첫 번째 사람의 성별 ('남' 또는 '여')
 * @param gender2 두 번째 사람의 성별 ('남' 또는 '여')
 * @returns 궁합 점수, 사주 정보, 살 분석 결과, 설명
 */
/**
 * 사주를 숫자 배열로 변환 (백엔드 API용)
 * [년간, 년지, 월간, 월지, 일간, 일지]
 */
function sajuToNumberArray(saju: Saju): number[] {
  return [
    ganToNumber(saju.year.gan),
    jiToNumber(saju.year.ji),
    ganToNumber(saju.month.gan),
    jiToNumber(saju.month.ji),
    ganToNumber(saju.day.gan),
    jiToNumber(saju.day.ji),
  ];
}

/**
 * 성별을 숫자로 변환 (1=남자, 0=여자)
 */
function genderToNumber(gender: string): number {
  if (!gender) return 0;
  const g = gender.trim();
  return (g === '남' || g === '남자' || g === 'male' || g === '1') ? 1 : 0;
}

export async function calculateCompatibility(
  birthDate1: string,
  birthTime1: string,
  birthDate2: string,
  birthTime2: string,
  name1: string = '',
  name2: string = '',
  gender1: string = '',
  gender2: string = ''
): Promise<{
  score: number;              // 궁합 점수 (0-100)
  saju1: Saju;                // 첫 번째 사람의 사주
  saju2: Saju;                // 두 번째 사람의 사주
  salAnalysis: SalAnalysis[]; // 살 분석 결과
  explanation: string;         // 점수에 대한 설명
}> {
  // 생년월일 파싱 및 검증
  if (!birthDate1 || !birthDate2) {
    throw new Error('생년월일은 필수입니다.');
  }
  
  const date1Parts = birthDate1.split('-');
  const date2Parts = birthDate2.split('-');
  
  if (date1Parts.length !== 3 || date2Parts.length !== 3) {
    throw new Error('생년월일 형식이 올바르지 않습니다. (YYYY-MM-DD 형식 필요)');
  }
  
  const [y1, m1, d1] = date1Parts.map(Number);
  const [y2, m2, d2] = date2Parts.map(Number);
  
  // 날짜 유효성 검증
  if (isNaN(y1) || isNaN(m1) || isNaN(d1) || isNaN(y2) || isNaN(m2) || isNaN(d2)) {
    throw new Error('생년월일이 올바르지 않습니다.');
  }
  
  if (y1 < 1900 || y1 > 2100 || y2 < 1900 || y2 > 2100) {
    throw new Error('생년은 1900년부터 2100년까지 입력 가능합니다.');
  }
  
  if (m1 < 1 || m1 > 12 || m2 < 1 || m2 > 12) {
    throw new Error('월은 1월부터 12월까지 입력 가능합니다.');
  }
  
  if (d1 < 1 || d1 > 31 || d2 < 1 || d2 > 31) {
    throw new Error('일은 1일부터 31일까지 입력 가능합니다.');
  }
  
  // 1. 사주 계산: 양력 날짜를 간지로 변환 (시간은 사용하지 않음, 기본값 12시 사용)
  const saju1 = calculateSaju(y1, m1, d1, 12);
  const saju2 = calculateSaju(y2, m2, d2, 12);
  
  // 2. 백엔드 API 호출 (TensorFlow 모델 사용)
  const person0 = sajuToNumberArray(saju1);
  const person1 = sajuToNumberArray(saju2);
  const gender0 = genderToNumber(gender1);
  const gender1_num = genderToNumber(gender2);
  
  const backendResult = await compatibilityAPI.calculateCompatibility({
    person0,
    person1,
    gender0,
    gender1: gender1_num,
  });
  
  if (!backendResult.success || !backendResult.data) {
    throw new Error(
      backendResult.message || backendResult.error || '백엔드 API 호출 실패'
    );
  }
  
  // 3. 백엔드에서 계산된 점수와 살 데이터 사용
  const score = backendResult.data.finalScore;
  const backendSal0 = backendResult.data.sal0 || [0, 0, 0, 0, 0, 0, 0, 0];
  const backendSal1 = backendResult.data.sal1 || [0, 0, 0, 0, 0, 0, 0, 0];
  
  console.log('백엔드 API 호출 성공:', {
    originalScore: backendResult.data.originalScore,
    finalScore: backendResult.data.finalScore,
  });
  
  const salResult = {
    sal0: backendSal0,
    sal1: backendSal1,
    totalDeduction: backendResult.data.originalScore - score,
  };
  
  // 5. 살 분석 결과를 SalAnalysis 형식으로 변환
  const salAnalysis: SalAnalysis[] = [];
  const salNames = [
    '열정 에너지 예술 중독',
    '예민 직감 영적 불안',
    '감정기복 갈등 오해 고독',
    '강함 용감 충동 변화',
    '책임감 의리 완벽 자존심 인내',
    '충돌 자유 고집',
    '카리스마 승부욕 용감 외로움',
    '의지 솔직 직설 개성 고집 독립심',
  ];
  
  // 첫 번째 사람의 살
  for (let i = 0; i < 8; i++) {
    if (salResult.sal0[i] > 0) {
      salAnalysis.push({
        type: salNames[i],
        count: Math.round(salResult.sal0[i]),
        description: `${salNames[i]} 살이 ${Math.round(salResult.sal0[i])}점 감점되었습니다.`,
      });
    }
  }
  
  // 두 번째 사람의 살
  for (let i = 0; i < 8; i++) {
    if (salResult.sal1[i] > 0) {
      const existing = salAnalysis.find((s) => s.type === salNames[i]);
      if (existing) {
        existing.count += Math.round(salResult.sal1[i]);
        existing.description = `${salNames[i]} 살이 총 ${existing.count}점 감점되었습니다.`;
      } else {
        salAnalysis.push({
          type: salNames[i],
          count: Math.round(salResult.sal1[i]),
          description: `${salNames[i]} 살이 ${Math.round(salResult.sal1[i])}점 감점되었습니다.`,
        });
      }
    }
  }
  
  // 6. 점수 범위 조정: 0-100점 사이로 제한
  score = Math.max(0, Math.min(100, score));
  
  // 12. 점수에 따른 설명 생성
  let explanation = '';
  if (score >= 80) {
    explanation = '매우 좋은 궁합입니다. 서로 잘 어울리며 행복한 관계를 이어갈 수 있습니다.';
  } else if (score >= 60) {
    explanation = '무난한 궁합입니다. 서로 노력하면 좋은 관계를 유지할 수 있습니다.';
  } else if (score >= 40) {
    explanation = '보통의 궁합입니다. 서로 이해하고 양보하면 관계를 발전시킬 수 있습니다.';
  } else {
    explanation = '주의가 필요한 궁합입니다. 서로의 차이를 인정하고 소통이 중요합니다.';
  }
  
  return {
    score,
    saju1,
    saju2,
    salAnalysis,
    explanation,
  };
}

