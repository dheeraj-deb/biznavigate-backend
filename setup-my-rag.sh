#!/bin/bash

echo "🔍 Finding YOUR businesses with products..."
echo ""

# Find businesses using Node.js
node -e "
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function run() {
  const businesses = await prisma.\$queryRaw\`
    SELECT
      b.business_id,
      b.business_name,
      COUNT(p.product_id) as product_count
    FROM businesses b
    LEFT JOIN products p ON b.business_id = p.business_id AND p.is_active = true
    GROUP BY b.business_id, b.business_name
    HAVING COUNT(p.product_id) > 0
    ORDER BY product_count DESC
    LIMIT 5
  \`;

  console.log('📦 Your Businesses:\n');
  businesses.forEach((b, i) => {
    console.log(\`\${i+1}. \${b.business_name}\`);
    console.log(\`   ID: \${b.business_id}\`);
    console.log(\`   Products: \${b.product_count}\n\`);
  });

  if (businesses.length > 0) {
    const first = businesses[0];
    console.log('🎯 Indexing first business: ' + first.business_name);
    console.log('   Business ID: ' + first.business_id);
    console.log('');

    // Save to temp file for shell script
    const fs = require('fs');
    fs.writeFileSync('/tmp/business_id.txt', first.business_id);
  }

  await prisma.\$disconnect();
}

run();
"

if [ -f /tmp/business_id.txt ]; then
  BUSINESS_ID=$(cat /tmp/business_id.txt)
  echo "📦 Indexing products for business: $BUSINESS_ID"
  echo ""

  curl -s -X POST http://localhost:8004/api/v1/rag/index-products \
    -H 'Content-Type: application/json' \
    -d "{\"business_id\":\"$BUSINESS_ID\",\"batch_size\":100}" | jq .

  echo ""
  echo "✅ Now testing RAG chat with YOUR business:"
  echo ""

  curl -s -X POST http://localhost:8004/api/v1/rag/chat \
    -H 'Content-Type: application/json' \
    -d "{\"query\":\"do you have usb cables\",\"business_id\":\"$BUSINESS_ID\",\"collection\":\"products\"}" | jq .

  echo ""
  echo "💾 Your business ID is: $BUSINESS_ID"
  echo "📝 Use this in your code/workflow configuration"
else
  echo "❌ No businesses found with products"
fi
