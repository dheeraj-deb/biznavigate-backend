const axios = require('axios');

const RAG_URL = 'http://localhost:8004/api/v1/rag/search';
const BUSINESS_ID = 'dd8ae5a1-cab4-4041-849d-e108d74490d3';

async function debugSearch(query) {
  console.log(`\n🔍 Debugging: "${query}"`);
  console.log('─'.repeat(70));

  // Try with very low threshold to see ALL matches
  const { data } = await axios.post(RAG_URL, {
    query,
    business_id: BUSINESS_ID,
    collection: 'products',
    limit: 10,
    threshold: 0.0  // Show everything
  });

  console.log(`Found ${data.results.length} total results:\n`);

  data.results.slice(0, 5).forEach((r, i) => {
    const match = (r.score * 100).toFixed(1);
    const icon = r.score >= 0.5 ? '🟢' : r.score >= 0.3 ? '🟡' : '🔴';
    console.log(`${i+1}. ${icon} ${r.metadata.name}`);
    console.log(`   Score: ${match}% | Price: ₹${r.metadata.price}`);
    console.log(`   Description: ${r.metadata.description || '(none)'}`);
  });

  const above50 = data.results.filter(r => r.score >= 0.5).length;
  const above30 = data.results.filter(r => r.score >= 0.3).length;

  console.log(`\n📊 Summary:`);
  console.log(`   Above 50% (threshold 0.5): ${above50} products`);
  console.log(`   Above 30% (threshold 0.3): ${above30} products`);
}

async function main() {
  console.log('\n🔬 RAG Score Debugging\n');
  console.log('Legend: 🟢 Good (>50%) | 🟡 Fair (30-50%) | 🔴 Low (<30%)\n');

  await debugSearch('laptop');
  await debugSearch('keyboard');
  await debugSearch('mouse');
  await debugSearch('usb');

  console.log('\n');
}

main();
