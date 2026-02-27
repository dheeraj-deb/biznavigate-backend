/**
 * Test RAG search with different queries and thresholds
 */

const axios = require('axios');

const RAG_SERVICE_URL = 'http://localhost:8004';
const BUSINESS_ID = 'dd8ae5a1-cab4-4041-849d-e108d74490d3';

async function testSearch(query, threshold = 0.5, limit = 5) {
  console.log(`\n🔍 Searching for: "${query}" (threshold: ${threshold})`);
  console.log('─'.repeat(60));

  try {
    const response = await axios.post(`${RAG_SERVICE_URL}/api/v1/rag/search`, {
      query: query,
      business_id: BUSINESS_ID,
      collection: 'products',
      limit: limit,
      threshold: threshold
    });

    const { results, cached, processing_time_ms } = response.data;

    if (results.length === 0) {
      console.log('❌ No results found (try lowering threshold)\n');
      return;
    }

    console.log(`✅ Found ${results.length} results (${processing_time_ms}ms${cached ? ', cached' : ''})\n`);

    results.forEach((result, idx) => {
      const { metadata, score } = result;
      const matchPercent = (score * 100).toFixed(1);
      console.log(`${idx + 1}. ${metadata.name}`);
      console.log(`   Price: ₹${metadata.price} | Category: ${metadata.category}`);
      console.log(`   Match: ${matchPercent}% ${score >= 0.7 ? '🟢' : score >= 0.5 ? '🟡' : '🔴'}`);
      if (metadata.description) {
        console.log(`   Desc: ${metadata.description}`);
      }
      console.log('');
    });
  } catch (error) {
    console.error('❌ Search failed:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('\n🧪 RAG Search Testing\n');
  console.log('Legend: 🟢 Excellent (>70%) | 🟡 Good (50-70%) | 🔴 Fair (<50%)\n');

  // Test various queries
  await testSearch('usb cable', 0.5, 3);
  await testSearch('wireless headphones', 0.5, 3);
  await testSearch('laptop', 0.5, 3);
  await testSearch('gaming', 0.5, 3);
  await testSearch('phone accessories', 0.5, 5);

  // Test same query with different thresholds
  console.log('\n' + '='.repeat(60));
  console.log('📊 Threshold Comparison for "usb"');
  console.log('='.repeat(60));

  await testSearch('usb', 0.7, 3);
  await testSearch('usb', 0.5, 3);
  await testSearch('usb', 0.3, 3);
}

main().catch(console.error);
