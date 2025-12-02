/**
 * API 클라이언트 유틸리티
 * - 백엔드 API 호출을 위한 공통 함수
 * - 인증 토큰 관리
 * - 에러 처리
 */

// 👇 [필수 수정] 여기에 본인의 Render 서버 주소를 넣으세요 (마지막에 슬래시 / 없이)
const RENDER_SERVER_URL = "https://saju-server.onrender.com/predict";

// 배포 환경에서는 실제 서버 URL 사용, 로컬에서는 환경 변수 또는 localhost
const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    
    if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
      console.warn('⚠️ EXPO_PUBLIC_API_BASE_URL이 설정되지 않았습니다. 현재 도메인을 사용합니다:', window.location.origin);
    }
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

const getAPIBaseUrl = () => getApiBaseUrl();

/**
 * 인증 토큰 가져오기
 */
async function getAuthToken(): Promise<string | null> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('authToken');
    }
    return null;
  } catch (error) {
    console.error('토큰 가져오기 실패:', error);
    return null;
  }
}

/**
 * 인증 토큰 저장하기
 */
async function setAuthToken(token: string): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('authToken', token);
    }
  } catch (error) {
    console.error('토큰 저장 실패:', error);
  }
}

/**
 * 인증 토큰 제거하기
 */
async function removeAuthToken(): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('authToken');
    }
  } catch (error) {
    console.error('토큰 제거 실패:', error);
  }
}

/**
 * API 요청 공통 함수
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // ---------------------------------------------------------------------------
  // 🚀 [주소 분기 처리] 
  // 사주 계산 요청(endpoint에 'calculate' 또는 'compatibility' 포함)인 경우
  // Node.js 백엔드 대신 Render Python 서버로 요청을 보냅니다.
  // ---------------------------------------------------------------------------
  let url = '';

  if (endpoint.includes('calculate') || endpoint.includes('compatibility')) {
    console.log(`🔀 [Redirect] 사주 계산 요청을 Render 서버로 연결합니다.`);
    // Render 서버의 예측 엔드포인트로 변경
    url = `${RENDER_SERVER_URL}/predict`; 
  } else {
    // 그 외 일반 요청(로그인, 채팅 등)은 기존 백엔드로 연결
    url = `${getAPIBaseUrl()}${endpoint}`;
  }
  // ---------------------------------------------------------------------------
  
  try {
    console.log(`🌐 API 요청: ${url}`, { method: options.method || 'GET' });
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`📡 API 응답 상태: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ API 오류 응답:`, errorData);
      const error = new Error(
        errorData.message || `API 오류: ${response.status} ${response.statusText}`
      ) as Error & { response?: any };
      error.response = errorData;
      throw error;
    }

    const data = await response.json();
    // console.log(`✅ API 성공 응답:`, data); // 로그가 너무 많으면 주석 처리
    return data;
  } catch (error) {
    console.error(`❌ API 요청 실패 (${endpoint}):`, error);
    throw error;
  }
}

/**
 * 인증 관련 API
 */
export const authAPI = {
  async login(email: string, password: string) {
    try {
      const response = await apiRequest<{
        success: boolean;
        token?: string;
        user?: any;
        message?: string;
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!response || typeof response !== 'object') {
        return { success: false, message: '서버 응답 형식이 올바르지 않습니다.' };
      }
      if (response.success === true && response.token) {
        await setAuthToken(response.token);
      }
      return response;
    } catch (error: any) {
      const errorMessage = error?.response?.message || error?.message || '로그인 중 오류가 발생했습니다.';
      return { success: false, message: errorMessage };
    }
  },

  async signup(email: string, password: string, name?: string) {
    try {
      const response = await apiRequest<{
        success: boolean;
        token?: string;
        user?: any;
        message?: string;
      }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });

      if (!response || typeof response !== 'object') {
        return { success: false, message: '서버 응답 형식이 올바르지 않습니다.' };
      }
      if (response.success === true && response.token) {
        await setAuthToken(response.token);
      }
      return response;
    } catch (error: any) {
      const errorMessage = error?.response?.message || error?.message || '회원가입 중 오류가 발생했습니다.';
      return { success: false, message: errorMessage };
    }
  },

  async logout() {
    await removeAuthToken();
  },

  async getProfile() {
    return apiRequest<{ success: boolean; user?: any; }>('/api/auth/profile', { method: 'GET' });
  },

  async updateProfile(profile: { name: string; birthDate: string; birthTime: string; gender: string; }) {
    return apiRequest<{ success: boolean; user?: any; }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },
};

/**
 * AI 조언 API
 */
export const aiAPI = {
  async getAdvice(request: any) {
    return apiRequest<{
      success: boolean;
      data?: { advice: string; tips?: string[]; summary?: string; };
      message?: string;
    }>('/api/ai-advice', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};

/**
 * 궁합 계산 API
 */
export const compatibilityAPI = {
  async calculateCompatibility(request: {
    person0: number[];
    person1: number[];
    gender0: number;
    gender1: number;
  }) {
    // 👇 [여기에 본인의 렌더 주소를 넣으세요] 
    // 주소 끝에 /predict 를 꼭 붙여야 합니다!
    const RENDER_URL = "https://saju-server-abcd.onrender.com/predict";

    console.log("🚀 [Direct] Render 서버로 요청을 보냅니다:", RENDER_URL);

    try {
      // apiRequest 함수를 거치지 않고, 직접 fetch를 사용하여 렌더 서버로 쏩니다.
      const response = await fetch(RENDER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Python 서버가 원하는 이름(token0)으로 바꿔서 보냅니다.
        body: JSON.stringify({
          token0: request.person0,
          token1: request.person1,
          gender0: request.gender0,
          gender1: request.gender1
        }),
      });

      if (!response.ok) {
        throw new Error(`Render Server Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Render 서버 응답 성공:", data);

      return {
        success: true,
        data: {
            finalScore: data.score,    // Python은 score로 줌
            originalScore: data.score,
            sal0: data.sal0,
            sal1: data.sal1
        }
      };
      
    } catch (error) {
      console.error("❌ Render 서버 연결 실패:", error);
      // 에러 발생 시 기본값 반환 (앱 죽음 방지)
      return {
        success: false,
        message: "계산 서버 연결 실패",
        data: {
            finalScore: 50,
            originalScore: 50,
            sal0: [0,0,0,0,0,0,0,0],
            sal1: [0,0,0,0,0,0,0,0]
        }
      };
    }
  },
};


/**
 * AI 채팅 API
 */
export const aiChatAPI = {
  async sendMessage(request: any) {
    try {
      const url = `${getAPIBaseUrl()}/api/ai-chat`; // 채팅은 Node.js 서버 사용
      const token = await getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (request.userId) headers['x-user-id'] = request.userId;

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API 오류: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('❌ AI 채팅 API 호출 실패:', error);
      throw error;
    }
  },
};

