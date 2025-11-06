/**
 * 절기 정보 데이터
 * cal.csv 파일에서 추출한 절기 정보
 * 형식: [년도, 절기1날짜, 절기1시간, 절기2날짜, 절기2시간, ...]
 * 
 * Python 코드의 getCalendar 함수를 TypeScript로 변환
 */

// cal.csv 파일을 파싱한 데이터 (런타임에 로드)
let calendarDataCache: { [year: number]: number[] } | null = null;

/**
 * cal.csv 파일을 동적으로 로드하는 함수
 */
export async function loadCalendarData(): Promise<{ [year: number]: number[] }> {
  if (calendarDataCache) {
    return calendarDataCache;
  }

  try {
    // 웹 환경에서는 fetch로 CSV 파일 읽기
    if (typeof fetch !== 'undefined') {
      const response = await fetch('/cal.csv');
      const text = await response.text();
      calendarDataCache = parseCalendarCSV(text);
      return calendarDataCache;
    }
    // Node.js 환경에서는 fs 모듈 사용 (백엔드에서만 가능)
    // 여기서는 기본 데이터 반환
    return {};
  } catch (error) {
    console.error('절기 데이터 로드 실패:', error);
    return {}; // 빈 객체 반환
  }
}

/**
 * CSV 텍스트를 파싱하여 객체로 변환
 */
function parseCalendarCSV(csvText: string): { [year: number]: number[] } {
  const lines = csvText.split('\n');
  const data: { [year: number]: number[] } = {};
  
  // 첫 번째 줄은 헤더이므로 건너뛰기
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => {
      const trimmed = v.trim();
      return trimmed ? parseInt(trimmed, 10) : 0;
    }).filter(v => !isNaN(v));
    
    if (values.length > 0 && values[0] > 0) {
      data[values[0]] = values;
    }
  }
  
  return data;
}

/**
 * Python 코드의 getCalendar 함수를 TypeScript로 변환
 * @param year 년도
 * @param month 월 (1-12)
 * @param day 일 (1-31)
 * @param hour 시 (0-23)
 * @param minute 분 (0-59)
 * @returns [년간, 년지, 월간, 월지]
 */
export async function getCalendar(
  year: number,
  month: number,
  day: number,
  hour: number = 12,
  minute: number = 0
): Promise<{ yearGan: number; yearJi: number; monthGan: number; monthJi: number }> {
  const data = await loadCalendarData();
  const yearData = data[year];
  
  if (!yearData || yearData.length < 25) {
    // 데이터가 없으면 기본 계산 방식 사용
    return getCalendarFallback(year, month, day, hour, minute);
  }

  // Python 코드 로직 구현
  const y = year;
  const m = month;
  const d = day;
  const h = hour;
  const min = minute;

  const n1 = y * 100 + m;
  const n2 = d * 10000 + h * 100 + min;

  // 절기 데이터 인덱스 (Python 코드의 data[y-1904] 인덱스)
  const yearIndex = y - 1904;
  if (yearIndex < 0 || yearIndex >= Object.keys(data).length) {
    return getCalendarFallback(year, month, day, hour, minute);
  }

  // 절기 날짜/시간 추출 (Python 코드의 b_y, d_y, f_y 등)
  // 인덱스: 1,3,5,7,9,11,13,15,17,19,21,23 (홀수 인덱스 = 절기 날짜)
  // 인덱스: 2,4,6,8,10,12,14,16,18,20,22,24 (짝수 인덱스 = 절기 시간)
  const b_y = yearData[1]; // 1월 절기 날짜
  const c_y = yearData[2]; // 1월 절기 시간
  const d_y = yearData[3]; // 2월 절기 날짜
  const e_y = yearData[4]; // 2월 절기 시간
  const f_y = yearData[5]; // 3월 절기 날짜
  const g_y = yearData[6]; // 3월 절기 시간
  const h_y = yearData[7]; // 4월 절기 날짜
  const i_y = yearData[8]; // 4월 절기 시간
  const j_y = yearData[9]; // 5월 절기 날짜
  const k_y = yearData[10]; // 5월 절기 시간
  const l_y = yearData[11]; // 6월 절기 날짜
  const m_y = yearData[12]; // 6월 절기 시간
  const n_y = yearData[13]; // 7월 절기 날짜
  const o_y = yearData[14]; // 7월 절기 시간
  const p_y = yearData[15]; // 8월 절기 날짜
  const q_y = yearData[16]; // 8월 절기 시간
  const r_y = yearData[17]; // 9월 절기 날짜
  const s_y = yearData[18]; // 9월 절기 시간
  const t_y = yearData[19]; // 10월 절기 날짜
  const u_y = yearData[20]; // 10월 절기 시간
  const v_y = yearData[21]; // 11월 절기 날짜
  const w_y = yearData[22]; // 11월 절기 시간
  const x_y = yearData[23]; // 12월 절기 날짜
  const y_y = yearData[24]; // 12월 절기 시간

  // 년간 계산 (Python 코드의 ry, ys 계산)
  const ry = (y - 1904) % 10;
  let ys = ry + 1;
  if (n1 < d_y) {
    ys -= 1;
  }
  if (n1 === d_y && n2 < e_y) {
    ys -= 1;
  }
  if (ys === 0) {
    ys = 10;
  }

  // 년지 계산 (Python 코드의 ry2, yg 계산)
  const ry2 = (y - 1990) % 12;
  let yg = 0;
  if (ry2 === 0) yg = 3;
  else if (ry2 === 1) yg = 4;
  else if (ry2 === 2) yg = 5;
  else if (ry2 === 3) yg = 6;
  else if (ry2 === 4) yg = 7;
  else if (ry2 === 5) yg = 8;
  else if (ry2 === 6) yg = 9;
  else if (ry2 === 7) yg = 10;
  else if (ry2 === 8) yg = 11;
  else if (ry2 === 9) yg = 12;
  else if (ry2 === 10) yg = 1;
  else if (ry2 === 11) yg = 2;

  if (n1 < d_y) {
    yg -= 1;
  }
  if (n1 === d_y && n2 < e_y) {
    yg -= 1;
  }
  if (yg === 0) {
    yg = 12;
  }

  // 월지 계산 (Python 코드의 mg 계산)
  let mg = 0;
  if (n1 === b_y) {
    mg = n2 < c_y ? 11 : 12;
  } else if (n1 === d_y) {
    mg = n2 < e_y ? 12 : 1;
  } else if (n1 === f_y) {
    mg = n2 < g_y ? 1 : 2;
  } else if (n1 === h_y) {
    mg = n2 < i_y ? 2 : 3;
  } else if (n1 === j_y) {
    mg = n2 < k_y ? 3 : 4;
  } else if (n1 === l_y) {
    mg = n2 < m_y ? 4 : 5;
  } else if (n1 === n_y) {
    mg = n2 < o_y ? 5 : 6;
  } else if (n1 === p_y) {
    mg = n2 < q_y ? 6 : 7;
  } else if (n1 === r_y) {
    mg = n2 < s_y ? 7 : 8;
  } else if (n1 === t_y) {
    mg = n2 < u_y ? 8 : 9;
  } else if (n1 === v_y) {
    mg = n2 < w_y ? 9 : 10;
  } else if (n1 === x_y) {
    mg = n2 < y_y ? 10 : 11;
  }

  // 월간 계산 (Python 코드의 ms 계산)
  let ms = 0;
  if (ys === 1 || ys === 6) {
    ms = 3 + (mg - 1);
  } else if (ys === 2 || ys === 7) {
    ms = 5 + (mg - 1);
  } else if (ys === 3 || ys === 8) {
    ms = 7 + (mg - 1);
  } else if (ys === 4 || ys === 9) {
    ms = 9 + (mg - 1);
  } else if (ys === 5 || ys === 10) {
    ms = 1 + (mg - 1);
  }
  if (ms > 10) {
    ms = ms - 10;
  }

  // Python 코드의 yg, mg 조정
  yg = yg + 2;
  if (yg === 13) yg = 1;
  if (yg === 14) yg = 2;
  mg = mg + 2;
  if (mg === 13) mg = 1;
  if (mg === 14) mg = 2;

  return {
    yearGan: ys,
    yearJi: yg,
    monthGan: ms,
    monthJi: mg,
  };
}

/**
 * 절기 데이터가 없을 때 사용하는 기본 계산 방식
 */
function getCalendarFallback(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): { yearGan: number; yearJi: number; monthGan: number; monthJi: number } {
  // 간단한 계산 방식 (정확도는 떨어짐)
  const baseYear = 1984;
  const offset = (year - baseYear) % 60;
  const yearGan = (offset % 10) + 1;
  const yearJi = (offset % 12) + 1;
  
  const monthGan = ((yearGan - 1) * 2 + month) % 10 + 1;
  const monthJi = month;
  
  return {
    yearGan,
    yearJi,
    monthGan,
    monthJi,
  };
}

