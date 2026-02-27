const axios = require('axios');

const RAG_URL = 'http://localhost:8004/api/v1/rag/search';
const BUSINESS_ID = 'dd8ae5a1-cab4-4041-849d-e108d74490d3';

async function testWithThreshold(query, threshold) {
  const { data } = await axios.post(RAG_URL, {
    query,
    business_id: BUSINESS_ID,
    collection: 'products',
    limit: 3,
    threshold
  });
  return data.results;
}

async function main() {
  console.log('\n✅ Final RAG Search Test (Threshold: 0.4)\n');

  const searches = [
    'usb cable',
    'wireless headphones',
    'laptop',
    'keyboard',
    'mouse',
    'charger',
    'gaming',
  ];

  for (const query of searches) {
    const results = await testWithThreshold(query, 0.4);

    if (results.length > 0) {
      const top = results[0];
      const match = (top.score * 100).toFixed(0);
      console.log(`✅ "${query}"`);
      console.log(`   → ${top.metadata.name} - ₹${top.metadata.price} [${match}% match]`);
    } else {
      console.log(`❌ "${query}"`);
      console.log(`   → No results found`);
    }
  }

  console.log('\n📊 Summary:');
  console.log('   Default threshold is now 0.4 (40%)');
  console.log('   This works well for short product descriptions');
  console.log('   You can override in workflow JSON with custom threshold\n');
}

main();
