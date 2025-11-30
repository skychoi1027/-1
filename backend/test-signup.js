/**
 * 회원가입 API 테스트 스크립트
 */

async function testSignup() {
  try {
    console.log('🧪 회원가입 API 테스트 시작...\n');

    const testData = {
      email: 'test@example.com',
      password: 'test123',
      name: '테스트사용자'
    };

    console.log('📤 요청 데이터:', JSON.stringify(testData, null, 2));
    console.log('\n⏳ API 호출 중...\n');

    const response = await fetch('http://localhost:3000/api/auth/signup', {
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
      console.log('\n✅ 회원가입 성공!');
      console.log('사용자 ID:', result.user.id);
      console.log('이메일:', result.user.email);
    } else {
      console.log('\n❌ 회원가입 실패');
      console.log('오류 메시지:', result.message);
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.log('\n💡 백엔드 서버가 실행 중인지 확인하세요:');
    console.log('   cd backend && node server.js');
  }
}

testSignup();

