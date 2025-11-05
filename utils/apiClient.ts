/**
 * API 클라이언트 유틸리티
 * - 백엔드 API 호출을 위한 공통 함수
 * - 인증 토큰 관리
 * - 에러 처리
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

/**
 * 인증 토큰 가져오기 (로컬 스토리지 또는 AsyncStorage)
 */
async function getAuthToken(): Promise<string | null> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('authToken');
    }
    // 모바일의 경우 AsyncStorage 사용 필요
    // import AsyncStorage from '@react-native-async-storage/async-storage';
    // return await AsyncStorage.getItem('authToken');
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
    // 모바일의 경우 AsyncStorage 사용 필요
    // import AsyncStorage from '@react-native-async-storage/async-storage';
    // await AsyncStorage.setItem('authToken', token);
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
    // 모바일의 경우 AsyncStorage 사용 필요
    // import AsyncStorage from '@react-native-async-storage/async-storage';
    // await AsyncStorage.removeItem('authToken');
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
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API 오류: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API 요청 실패 (${endpoint}):`, error);
    throw error;
  }
}

/**
 * 인증 관련 API
 */
export const authAPI = {
  /**
   * 로그인
   */
  async login(email: string, password: string) {
    const response = await apiRequest<{
      success: boolean;
      token?: string;
      user?: any;
      message?: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.token) {
      await setAuthToken(response.token);
    }

    return response;
  },

  /**
   * 회원가입
   */
  async signup(email: string, password: string, name?: string) {
    return apiRequest<{
      success: boolean;
      token?: string;
      user?: any;
      message?: string;
    }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  /**
   * 로그아웃
   */
  async logout() {
    await removeAuthToken();
  },

  /**
   * 프로필 조회
   */
  async getProfile() {
    return apiRequest<{
      success: boolean;
      user?: any;
    }>('/api/auth/profile', {
      method: 'GET',
    });
  },

  /**
   * 프로필 업데이트
   */
  async updateProfile(profile: {
    name: string;
    birthDate: string;
    birthTime: string;
    gender: string;
  }) {
    return apiRequest<{
      success: boolean;
      user?: any;
    }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },
};

/**
 * AI 조언 API
 */
export const aiAPI = {
  /**
   * AI 조언 요청
   */
  async getAdvice(request: {
    score: number;
    explanation: string;
    salAnalysis: Array<{ type: string; count: number; description: string }>;
    user1: any;
    user2: any;
    saju1?: any;
    saju2?: any;
  }) {
    return apiRequest<{
      success: boolean;
      data?: {
        advice: string;
        tips?: string[];
        summary?: string;
      };
      message?: string;
    }>('/api/ai-advice', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};

