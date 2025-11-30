/**
 * 궁합 계산 API 테스트 스크립트
 */

const testData = {
  person0: [1, 1, 2, 2, 3, 3], // [년간, 년지, 월간, 월지, 일간, 일지]
  person1: [4, 4, 5, 5, 6, 6],
  gender0: 1, // 남자
  gender1: 0, // 여자
};

async function testAPI() {
  try {
    console.log('🧪 궁합 계산 API 테스트 시작...\n');
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

    if (result.success && result.data) {
      console.log('\n✅ 궁합 계산 성공!');
      console.log(`📊 원본 점수: ${result.data.originalScore}`);
      console.log(`📊 최종 점수: ${result.data.finalScore}`);
      console.log(`⚠️  폴백 사용: ${result.data.fallback || false}`);
      
      if (result.data.fallback) {
        console.log('\n⚠️  경고: Python 스크립트 실행 실패로 기본값(100점)이 반환되었습니다.');
        console.log('💡 Python 스크립트와 모델 파일을 확인하세요.');
      }
    } else {
      console.log('\n❌ API 호출 실패');
      console.log('오류:', result.message || '알 수 없는 오류');
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

