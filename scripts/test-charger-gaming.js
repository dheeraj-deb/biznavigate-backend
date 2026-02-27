const axios = require('axios');

async function testQuery(query) {
  const { data } = await axios.post('http://localhost:8004/api/v1/rag/search', {
    query,
    business_id: 'dd8ae5a1-cab4-4041-849d-e108d74490d3',
    collection: 'products',
    limit: 10,
    threshold: 0.0  // Show all
  });

  console.log(`\n🔍 "${query}" - Top 5 matches:`);
  console.log('─'.repeat(70));

  data.results.slice(0, 5).forEach((r, i) => {
    const match = (r.score * 100).toFixed(1);
    const icon = r.score >= 0.4 ? '✅' : r.score >= 0.3 ? '🟡' : '🔴';
    console.log(`${icon} ${r.metadata.name} [${match}%]`);
    if (r.metadata.description) {
      console.log(`   ${r.metadata.description}`);
    }
  });

  const above40 = data.results.filter(r => r.score >= 0.4).length;
  console.log(`\n📊 Products above 40% threshold: ${above40}`);
}

async function main() {
  await testQuery('charger');
  await testQuery('gaming');
  await testQuery('phone charger');
  await testQuery('gaming keyboard');
}

main();
