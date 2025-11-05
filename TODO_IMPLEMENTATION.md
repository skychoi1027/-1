# 미완성/임시 구현 부분 정리

이 문서는 현재 프로젝트에서 임시로 구현되어 있거나 데이터베이스(MySQL) 연동이 필요한 부분들을 정리한 것입니다.

## 🔴 1. 인증 시스템 (로그인/회원가입) - **MySQL 필요**

### 현재 상태
- **임시 구현**: localStorage만 사용 (웹만 지원)
- **문제점**: 
  - 실제 인증 없이 이메일만으로 로그인 처리
  - 비밀번호 검증 없음
  - 서버 재시작 시 데이터 손실
  - 모바일에서 작동 안 함 (AsyncStorage 필요)

### 필요한 작업
1. **MySQL 데이터베이스 테이블 생성**
   ```sql
   CREATE TABLE users (
     id INT PRIMARY KEY AUTO_INCREMENT,
     email VARCHAR(255) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     name VARCHAR(100),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   ```

2. **백엔드 API 엔드포인트 구현**
   - `POST /api/auth/login` - 로그인
   - `POST /api/auth/signup` - 회원가입
   - `POST /api/auth/logout` - 로그아웃
   - `GET /api/auth/me` - 현재 사용자 정보 조회

3. **프론트엔드 수정 위치**
   - `contexts/AuthContext.tsx` (49-88줄): `login` 함수
   - `app/signup.tsx` (24-60줄): `handleSignup` 함수

### 구현 예시
```typescript
// contexts/AuthContext.tsx의 login 함수
const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.success) {
      // JWT 토큰 저장
      await AsyncStorage.setItem('authToken', data.token);
      setUser(data.user);
      return true;
    }
    return false;
  } catch (error) {
    console.error('로그인 실패:', error);
    return false;
  }
};
```

---

## 🔴 2. 프로필 저장 기능 - **MySQL 필요**

### 현재 상태
- **임시 구현**: localStorage만 사용 (웹만 지원)
- **문제점**:
  - 로그인한 사용자 간 프로필 공유 불가
  - 모바일에서 작동 안 함
  - 서버 재시작 시 데이터 손실

### 필요한 작업
1. **MySQL 데이터베이스 테이블 생성**
   ```sql
   CREATE TABLE user_profiles (
     id INT PRIMARY KEY AUTO_INCREMENT,
     user_id INT NOT NULL,
     name VARCHAR(100),
     birth_date DATE NOT NULL,
     birth_time TIME,
     gender ENUM('남', '여') NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
     UNIQUE KEY unique_user_profile (user_id)
   );
   ```

2. **백엔드 API 엔드포인트 구현**
   - `GET /api/profile` - 프로필 조회
   - `PUT /api/profile` - 프로필 업데이트

3. **프론트엔드 수정 위치**
   - `contexts/AuthContext.tsx` (102-122줄): `updateProfile` 함수
   - `app/profile.tsx`: 프로필 저장 시 API 호출 추가

### 구현 예시
```typescript
// contexts/AuthContext.tsx의 updateProfile 함수
const updateProfile = async (profile: AuthUser['profile']) => {
  if (!user) return;
  
  try {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    });
    const data = await response.json();
    if (data.success) {
      setUser({ ...user, profile: data.profile });
    }
  } catch (error) {
    console.error('프로필 저장 실패:', error);
  }
};
```

---

## 🟡 3. AI 조언 백엔드 연동 - **선택사항 (권장)**

### 현재 상태
- **작동 중**: OpenAI API 직접 호출
- **문제점**:
  - API 키가 프론트엔드에 노출 (보안 위험)
  - 사용량 제한 관리 어려움
  - 비용 관리 어려움

### 필요한 작업 (선택사항)
1. **백엔드 API 엔드포인트 구현**
   - `POST /api/ai-advice` - AI 조언 요청
   - API 키를 서버에서 관리
   - 사용량 제한 및 캐싱 구현

2. **환경 변수 설정**
   ```env
   EXPO_PUBLIC_USE_BACKEND_API=true
   EXPO_PUBLIC_API_BASE_URL=https://your-backend-api.com
   ```

3. **프론트엔드**: 이미 구현되어 있음 (`utils/aiService.ts`)
   - 백엔드 API 우선 사용, 실패 시 OpenAI 직접 호출로 폴백

### 상세 가이드
- `BACKEND_API_GUIDE.md` 파일 참고

---

## 🟢 4. 모바일 저장소 지원 (AsyncStorage)

### 현재 상태
- **웹만 지원**: localStorage 사용
- **문제점**: iOS/Android에서 프로필 저장 불가

### 필요한 작업
1. **패키지 설치**
   ```bash
   npm install @react-native-async-storage/async-storage
   ```

2. **Storage 유틸리티 생성**
   ```typescript
   // utils/storage.ts
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import { Platform } from 'react-native';

   export const storage = {
     async getItem(key: string) {
       if (Platform.OS === 'web') {
         return localStorage.getItem(key);
       }
       return await AsyncStorage.getItem(key);
     },
     async setItem(key: string, value: string) {
       if (Platform.OS === 'web') {
         localStorage.setItem(key, value);
       } else {
         await AsyncStorage.setItem(key, value);
       }
     },
     // ... 기타 메서드
   };
   ```

3. **수정 위치**
   - `contexts/AuthContext.tsx`: localStorage → storage 유틸리티 사용

---

## 📋 우선순위별 구현 체크리스트

### 높은 우선순위 (필수)
- [ ] **인증 시스템 구현** (로그인/회원가입)
  - MySQL users 테이블 생성
  - 백엔드 API 구현
  - 프론트엔드 연동
- [ ] **프로필 저장 기능 구현**
  - MySQL user_profiles 테이블 생성
  - 백엔드 API 구현
  - 프론트엔드 연동

### 중간 우선순위 (권장)
- [ ] **모바일 저장소 지원** (AsyncStorage)
  - 패키지 설치
  - Storage 유틸리티 생성
  - 프론트엔드 수정

### 낮은 우선순위 (선택)
- [ ] **AI 조언 백엔드 연동**
  - 백엔드 API 구현
  - 환경 변수 설정
  - (프론트엔드는 이미 구현됨)

---

## 🔧 백엔드 기술 스택 제안

### Node.js + Express + MySQL
```bash
# 필요한 패키지
npm install express mysql2 bcrypt jsonwebtoken cors dotenv
```

### Python + FastAPI + MySQL
```bash
# 필요한 패키지
pip install fastapi uvicorn mysql-connector-python bcrypt python-jose[cryptography]
```

자세한 백엔드 구현 예시는 `BACKEND_API_GUIDE.md` 참고

---

## 📝 참고 파일

- `contexts/AuthContext.tsx` - 인증 컨텍스트 (TODO 주석 포함)
- `app/signup.tsx` - 회원가입 화면 (TODO 주석 포함)
- `app/profile.tsx` - 프로필 화면
- `utils/aiService.ts` - AI 조언 서비스 (백엔드 연동 틀 포함)
- `BACKEND_API_GUIDE.md` - 백엔드 API 구현 가이드

