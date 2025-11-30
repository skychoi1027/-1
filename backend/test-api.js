/**
 * AI 조언 API 테스트 스크립트
 */

const testData = {
  score: 75,
  explanation: '테스트 설명',
  salAnalysis: [],
  user1: {
    name: '테스트1',
    gender: '남자',
    birthDate: '1990-01-01',
    birthTime: '12:00'
  },
  user2: {
    name: '테스트2',
    gender: '여자',
    birthDate: '1992-01-01',
    birthTime: '12:00'
  }
};

async function testAPI() {
  try {
    console.log('🧪 AI 조언 API 테스트 시작...\n');
    console.log('📤 요청 데이터:', JSON.stringify(testData, null, 2));
    console.log('\n⏳ API 호출 중...\n');

    const response = await fetch('http://localhost:3000/api/ai-advice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    console.log('📥 응답 상태:', response.status);
    console.log('📥 응답 데이터:', JSON.stringify(result, null, 2));

    if (result.success && result.data) {
      console.log('\n✅ AI 조언이 성공적으로 생성되었습니다!');
      console.log('\n📝 조언 내용:');
      console.log(result.data.advice);
      if (result.data.tips) {
        console.log('\n💡 팁:');
        result.data.tips.forEach((tip, i) => {
          console.log(`  ${i + 1}. ${tip}`);
        });
      }
    } else {
      console.log('\n❌ API 호출 실패');
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.log('\n💡 백엔드 서버가 실행 중인지 확인하세요:');
    console.log('   cd backend && node server.js');
  }
}

// Node.js 18+ fetch 지원 확인
if (typeof fetch === 'undefined') {
  console.error('❌ Node.js 18 이상이 필요합니다. fetch가 지원되지 않습니다.');
  process.exit(1);
}

testAPI();

