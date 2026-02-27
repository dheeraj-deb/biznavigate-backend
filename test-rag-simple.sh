#!/bin/bash

echo "Testing RAG Chat..."
echo ""

curl -X POST http://localhost:8004/api/v1/rag/chat \
-H 'Content-Type: application/json' \
-d '{
  "query": "do you have usb cables",
  "business_id": "dd8ae5a1-cab4-4041-849d-e108d74490d3",
  "collection": "products"
}' | jq .

echo ""
echo "If you see 'sources: []' then you're using wrong business_id"
echo "If you see a proper answer, then RAG is working fine!"
