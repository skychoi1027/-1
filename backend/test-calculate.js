/**
 * 궁합 계산 API 테스트 스크립트
 */

async function testCalculate() {
  try {
    console.log('🧪 궁합 계산 API 테스트 시작...\n');

    // 테스트 데이터: 1990-01-15와 1992-05-20
    // 사주: [년간, 년지, 월간, 월지, 일간, 일지]
    const testData = {
      person0: [6, 6, 0, 0, 0, 0], // 임시 데이터
      person1: [8, 8, 3, 3, 0, 0], // 임시 데이터
      gender0: 1, // 남자
      gender1: 0, // 여자
    };

    console.log('📤 요청 데이터:', JSON.stringify(testData, null, 2));
    console.log('\n⏳ API 호출 중...\n');

    const response = await fetch('http://localhost:3000/api/calculate-compatibility', {
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
      console.log('\n✅ 계산 성공!');
      console.log('최종 점수:', result.data.finalScore);
      console.log('원본 점수:', result.data.originalScore);
    } else {
      console.log('\n❌ 계산 실패');
      console.log('오류 메시지:', result.message);
      if (result.error) {
        console.log('에러 상세:', result.error);
      }
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.log('\n💡 백엔드 서버가 실행 중인지 확인하세요:');
    console.log('   cd backend && node server.js');
  }
}

testCalculate();

