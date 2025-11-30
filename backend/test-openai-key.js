/**
 * OpenAI API 키 확인 테스트 스크립트
 */
require('dotenv').config();

console.log('🔍 OpenAI API 키 확인 중...\n');

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.log('❌ OPENAI_API_KEY가 설정되지 않았습니다.');
  console.log('💡 backend/.env 파일에 OPENAI_API_KEY를 추가하세요.');
  process.exit(1);
}

console.log('✅ OPENAI_API_KEY가 설정되어 있습니다.');
console.log(`📝 키 앞부분: ${apiKey.substring(0, 20)}...`);
console.log(`📏 키 길이: ${apiKey.length}자\n`);

// OpenAI API 호출 테스트
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey });

console.log('🧪 OpenAI API 호출 테스트 시작...\n');

openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    {
      role: 'user',
      content: '안녕하세요. 간단히 인사만 해주세요.',
    },
  ],
  max_tokens: 50,
})
  .then((response) => {
    console.log('✅ OpenAI API 호출 성공!');
    console.log(`📝 응답: ${response.choices[0]?.message?.content || ''}\n`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ OpenAI API 호출 실패:');
    console.error(`   오류 메시지: ${error.message}`);
    if (error.status) {
      console.error(`   상태 코드: ${error.status}`);
    }
    if (error.response) {
      console.error(`   응답: ${JSON.stringify(error.response, null, 2)}`);
    }
    if (error.error) {
      console.error(`   오류 상세: ${JSON.stringify(error.error, null, 2)}`);
    }
    console.error(`   전체 오류 객체:`, error);
    process.exit(1);
  });

