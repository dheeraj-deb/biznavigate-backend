const axios = require('axios');

const RAG_URL = 'http://localhost:8004/api/v1/rag/search';
const BUSINESS_ID = 'dd8ae5a1-cab4-4041-849d-e108d74490d3';

async function quickTest() {
  console.log('🧪 Quick RAG Search Test\n');

  const searches = [
    'usb cable',
    'wireless headphones',
    'laptop',
    'keyboard',
    'mouse'
  ];

  for (const query of searches) {
    try {
      const { data } = await axios.post(RAG_URL, {
        query,
        business_id: BUSINESS_ID,
        collection: 'products',
        limit: 3,
        threshold: 0.5
      });

      const count = data.results.length;
      console.log(`📦 "${query}": ${count} results`);

      if (count > 0) {
        data.results.forEach(r => {
          const match = (r.score * 100).toFixed(0);
          console.log(`   ✅ ${r.metadata.name} - ₹${r.metadata.price} [${match}%]`);
        });
      } else {
        console.log('   ❌ No results found');
      }
      console.log('');
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
    }
  }
}

quickTest();
