const axios = require('axios');

const RAG_URL = 'http://localhost:8004/api/v1/rag/chat';
const BUSINESS_ID = 'dd8ae5a1-cab4-4041-849d-e108d74490d3';

async function testChat(query) {
  const { data } = await axios.post(RAG_URL, {
    query,
    business_id: BUSINESS_ID,
    collection: 'products',
    context_limit: 5,
    temperature: 0.7
  });

  console.log(`\n💬 "${query}"`);
  console.log(`🤖 ${data.answer}`);
  if (data.sources.length > 0) {
    console.log(`📦 Products: ${data.sources.map(s => s.metadata.name).join(', ')}`);
  }
}

async function main() {
  console.log('\n🔋 Testing Charger Queries\n');

  await testChat('what chargers do you have?');
  await testChat('do you have phone chargers?');
  await testChat('I need a fast charger');
  await testChat('usb charger');
}

main();
