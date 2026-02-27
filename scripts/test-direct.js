const axios = require('axios');

async function testDirect() {
  const tests = [
    { query: 'laptop', threshold: 0.4 },
    { query: 'laptop', threshold: 0.3 },
    { query: 'keyboard', threshold: 0.4 },
    { query: 'mouse', threshold: 0.4 },
  ];

  for (const test of tests) {
    const response = await axios.post('http://localhost:8004/api/v1/rag/search', {
      query: test.query,
      business_id: 'dd8ae5a1-cab4-4041-849d-e108d74490d3',
      collection: 'products',
      limit: 5,
      threshold: test.threshold
    });

    console.log(`\n🔍 Query: "${test.query}" | Threshold: ${test.threshold}`);
    console.log(`   Cached: ${response.data.cached}`);
    console.log(`   Results: ${response.data.results.length}`);

    response.data.results.forEach((r, i) => {
      const match = (r.score * 100).toFixed(1);
      console.log(`   ${i+1}. ${r.metadata.name} [${match}%]`);
    });
  }
}

testDirect();
