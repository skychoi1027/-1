/**
 * 로그인 API 테스트 스크립트
 */

async function testLogin() {
  try {
    console.log('🧪 로그인 API 테스트 시작...\n');

    const testData = {
      email: 'test@example.com',
      password: 'test123'
    };

    console.log('📤 요청 데이터:', JSON.stringify(testData, null, 2));
    console.log('\n⏳ API 호출 중...\n');

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    console.log('📥 응답 상태:', response.status);
    console.log('📥 응답 데이터:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ 로그인 성공!');
      console.log('사용자 ID:', result.user.id);
      console.log('이메일:', result.user.email);
      console.log('이름:', result.user.name);
    } else {
      console.log('\n❌ 로그인 실패');
      console.log('오류 메시지:', result.message);
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
}

testLogin();

