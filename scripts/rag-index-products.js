/**
 * Script to find businesses with products and index them in RAG service
 * Usage: node scripts/rag-index-products.js [business_id]
 */

const { PrismaClient } = require('../generated/prisma');
const axios = require('axios');

const prisma = new PrismaClient();
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://localhost:8004';

async function findBusinessesWithProducts(limit = 10) {
  console.log('🔍 Finding businesses with products...\n');

  const businesses = await prisma.$queryRaw`
    SELECT
      b.business_id,
      b.business_name,
      COUNT(p.product_id) as product_count
    FROM businesses b
    LEFT JOIN products p ON b.business_id = p.business_id AND p.is_active = true
    GROUP BY b.business_id, b.business_name
    HAVING COUNT(p.product_id) > 0
    ORDER BY product_count DESC
    LIMIT ${limit}
  `;

  return businesses;
}

async function indexProducts(businessId, batchSize = 100) {
  console.log(`\n📦 Indexing products for business: ${businessId}`);
  console.log('⏳ This may take a minute...\n');

  try {
    const response = await axios.post(`${RAG_SERVICE_URL}/api/v1/rag/index-products`, {
      business_id: businessId,
      batch_size: batchSize
    });

    const { success, products_indexed, processing_time_ms, errors } = response.data;

    if (success) {
      console.log(`✅ Successfully indexed ${products_indexed} products`);
      console.log(`⏱️  Processing time: ${processing_time_ms}ms`);
    } else {
      console.log(`❌ Indexing failed with ${errors.length} errors:`);
      errors.forEach(err => console.log(`   - ${err}`));
    }

    return response.data;
  } catch (error) {
    console.error('❌ Error calling RAG service:', error.response?.data || error.message);
    throw error;
  }
}

async function testSearch(businessId, query = 'shirt') {
  console.log(`\n🔎 Testing semantic search with query: "${query}"`);

  try {
    const response = await axios.post(`${RAG_SERVICE_URL}/api/v1/rag/search`, {
      query: query,
      business_id: businessId,
      collection: 'products',
      limit: 5,
      threshold: 0.7
    });

    const { results, cached, processing_time_ms } = response.data;

    console.log(`\n📊 Search Results (${results.length} found, ${processing_time_ms}ms${cached ? ', cached' : ''}):\n`);

    results.forEach((result, idx) => {
      const { metadata, score } = result;
      console.log(`${idx + 1}. ${metadata.name}`);
      console.log(`   Category: ${metadata.category || 'N/A'}`);
      console.log(`   Price: ₹${metadata.price || 'N/A'}`);
      console.log(`   Match Score: ${(score * 100).toFixed(1)}%`);
      console.log('');
    });

    return response.data;
  } catch (error) {
    console.error('❌ Search failed:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const specificBusinessId = args[0];

    if (specificBusinessId) {
      // Index specific business
      console.log(`📌 Indexing specific business: ${specificBusinessId}\n`);

      const result = await indexProducts(specificBusinessId);

      if (result.success && result.products_indexed > 0) {
        // Test search
        await testSearch(specificBusinessId);
      }
    } else {
      // Find and list businesses
      const businesses = await findBusinessesWithProducts();

      if (businesses.length === 0) {
        console.log('⚠️  No businesses with products found in database');
        return;
      }

      console.log('📋 Businesses with products:\n');
      businesses.forEach((biz, idx) => {
        console.log(`${idx + 1}. ${biz.business_name}`);
        console.log(`   ID: ${biz.business_id}`);
        console.log(`   Products: ${biz.product_count}`);
        console.log('');
      });

      // Auto-index the first business
      const firstBusiness = businesses[0];
      console.log(`\n🎯 Auto-indexing first business: ${firstBusiness.business_name}`);

      const result = await indexProducts(firstBusiness.business_id);

      if (result.success && result.products_indexed > 0) {
        // Test search
        await testSearch(firstBusiness.business_id);
      }

      console.log('\n💡 To index a specific business, run:');
      console.log(`   node scripts/rag-index-products.js <business_id>\n`);
    }

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
