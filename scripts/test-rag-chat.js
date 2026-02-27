const axios = require('axios');

const RAG_URL = 'http://localhost:8004/api/v1/rag/chat';
const BUSINESS_ID = 'dd8ae5a1-cab4-4041-849d-e108d74490d3';

async function testChat(query) {
  console.log(`\n💬 Question: "${query}"`);
  console.log('─'.repeat(70));

  try {
    const { data } = await axios.post(RAG_URL, {
      query: query,
      business_id: BUSINESS_ID,
      collection: 'products',
      context_limit: 5,
      temperature: 0.7,
      model: 'gpt-4o-mini'
    });

    console.log(`\n🤖 Answer:`);
    console.log(data.answer);

    console.log(`\n📚 Sources used: ${data.sources.length}`);
    if (data.sources.length > 0) {
      data.sources.forEach((source, idx) => {
        console.log(`   ${idx + 1}. ${source.metadata.name} - ₹${source.metadata.price} [${(source.score * 100).toFixed(0)}% match]`);
      });
    }

    console.log(`\n📊 Stats:`);
    console.log(`   Tokens used: ${data.tokens_used}`);
    console.log(`   Cached: ${data.cached ? 'Yes' : 'No'}`);
    console.log(`   Processing time: ${data.processing_time_ms}ms`);

  } catch (error) {
    console.error(`❌ Error: ${error.response?.data?.detail || error.message}`);
  }
}

async function main() {
  console.log('\n🧪 RAG Chat Testing\n');

  await testChat('do you have usb cables?');
  await testChat('what wireless headphones do you sell?');
  await testChat('show me laptops under 100000');
  await testChat('I need a keyboard for gaming');
  await testChat('what chargers do you have?');
}

main();
