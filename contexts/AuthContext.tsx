/**
 * 인증 컨텍스트 (전역 상태 관리)
 * - 로그인 상태 관리
 * - 사용자 정보 저장
 * - 로그인/로그아웃 기능
 */
import React, { createContext, ReactNode, useContext, useState } from 'react';

/**
 * 사용자 정보 타입
 */
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  profile?: {
    name: string;
    birthDate: string;
    birthTime: string;
    gender: string;
  };
}

/**
 * 인증 컨텍스트 타입
 */
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: AuthUser['profile']) => void;
}

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 인증 제공자 컴포넌트
 * - 앱 전체를 감싸서 인증 상태 제공
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  /**
   * 로그인 함수
   * TODO: 실제 백엔드 API와 연동
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // TODO: 실제 백엔드 API 호출
      // const response = await fetch(`${API_URL}/auth/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await response.json();
      // if (data.success) {
      //   setUser(data.user);
      //   return true;
      // }

      // 임시: 로그인 성공 처리 (실제로는 API 응답으로 처리)
      // 로컬 스토리지에서 프로필 정보 확인 (웹만 지원, 모바일은 AsyncStorage 사용 필요)
      let profile = null;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const savedProfile = window.localStorage.getItem('userProfile');
          profile = savedProfile ? JSON.parse(savedProfile) : null;
        }
      } catch (e) {
        // localStorage가 없는 경우 (모바일) 무시
        console.log('localStorage not available');
      }

      setUser({
        id: email, // 임시 ID
        email,
        name: profile?.name || email.split('@')[0],
        profile: profile || undefined,
      });

      return true;
    } catch (error) {
      console.error('로그인 실패:', error);
      return false;
    }
  };

  /**
   * 로그아웃 함수
   */
  const logout = () => {
    setUser(null);
    // 로컬 스토리지 정리 (선택적)
    // localStorage.removeItem('authToken');
  };

  /**
   * 프로필 업데이트 함수
   */
  const updateProfile = (profile: AuthUser['profile']) => {
    if (!user) return;

    // 로컬 스토리지에 저장 (임시, 실제로는 백엔드 API 호출)
    // 웹만 지원, 모바일은 AsyncStorage 사용 필요
    if (profile) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('userProfile', JSON.stringify(profile));
        }
      } catch (e) {
        // localStorage가 없는 경우 (모바일) 무시
        console.log('localStorage not available');
      }
    }

    setUser({
      ...user,
      profile,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 인증 훅
 * - 컨텍스트에서 인증 데이터를 쉽게 가져오기 위한 훅
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

