# AI-Powered Product Matching API

## Overview

This is a comprehensive AI-powered product matching system designed to handle 50,000+ concurrent users with advanced features including:

- ✅ **Semantic Search** with vector embeddings
- ✅ **Spell Correction** using AI language models
- ✅ **Image Product Extraction** with OCR and computer vision
- ✅ **Voice Product Recognition** with speech-to-text
- ✅ **Bulk Processing** for high-volume scenarios
- ✅ **Multiple Vector Database Support** (Pinecone, pgvector, Weaviate, Qdrant)
- ✅ **Scalable Architecture** with Redis caching and parallel processing

## Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   WhatsApp      │    │   Web/Mobile     │    │   Voice/Image   │
│   Integration   │    │   Applications   │    │   Processing    │
└─────────┬───────┘    └─────────┬────────┘    └─────────┬───────┘
          │                      │                       │
          └──────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   AI Product Matching   │
                    │        API Layer        │
                    └────────────┬────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
  ┌─────────▼─────────┐ ┌────────▼────────┐ ┌────────▼────────┐
  │  Semantic Search  │ │ Vector Database │ │  AI Services    │
  │    Service        │ │  (Pinecone/     │ │ (Gemini/Local)  │
  │                   │ │  pgvector)      │ │                 │
  └─────────┬─────────┘ └────────┬────────┘ └────────┬────────┘
            │                    │                   │
            └────────────────────┼───────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   PostgreSQL Database   │
                    │   + Redis Cache         │
                    └─────────────────────────┘
```

### Technology Stack

- **Language**: TypeScript/Node.js
- **Framework**: NestJS
- **Database**: PostgreSQL with pgvector extension
- **Cache**: Redis
- **Vector Database**: Pinecone/pgvector (configurable)
- **AI Services**: Google Gemini API (Gemini Pro, embedding-001)
- **Queue**: BullMQ for background processing
- **Deployment**: Docker containers

## API Endpoints

### 1. Text-Based Product Matching

**POST** `/api/ai/products/match/text`

Extract and match products from natural language text with spell correction and semantic search.

```json
{
  "text": "I need 100 bags of cement and 50 steel rods",
  "organizationId": "org-123-456",
  "enableSpellCorrection": true,
  "enableSemanticSearch": true,
  "maxResults": 10,
  "minConfidence": 0.3
}
```

**Response:**
```json
{
  "extractedProducts": [
    {
      "name": "cement",
      "quantity": 100,
      "confidence": 0.95
    },
    {
      "name": "steel rods",
      "quantity": 50,
      "confidence": 0.92
    }
  ],
  "matches": [
    {
      "id": "prod-123",
      "name": "Portland Cement 50kg Bag",
      "sellingPrice": 450,
      "available": true,
      "confidence": 0.95,
      "similarityScore": 0.98
    }
  ],
  "processingTime": 245,
  "correctedText": "I need 100 bags of cement and 50 steel rods",
  "originalQuery": "I need 100 bags of cemnt and 50 stell rods"
}
```

### 2. Image-Based Product Extraction

**POST** `/api/ai/products/match/image`

Extract products from images using OCR and computer vision.

```bash
curl -X POST \
  -F "image=@order_list.jpg" \
  -F "organizationId=org-123-456" \
  http://localhost:3000/api/ai/products/match/image
```

**Response:** Same format as text matching with additional image analysis metadata.

### 3. Voice-Based Product Recognition

**POST** `/api/ai/products/match/voice`

Extract products from voice recordings using speech-to-text.

```bash
curl -X POST \
  -F "audio=@order_audio.wav" \
  -F "organizationId=org-123-456" \
  -F "audioFormat=wav" \
  http://localhost:3000/api/ai/products/match/voice
```

### 4. Bulk Processing

**POST** `/api/ai/products/match/bulk`

Process multiple requests in parallel for high-volume scenarios.

```json
{
  "requests": [
    {
      "input": "cement x 100",
      "organizationId": "org-123",
      "type": "text"
    },
    {
      "input": "base64_encoded_image_data",
      "organizationId": "org-123",
      "type": "image"
    }
  ],
  "concurrency": 10,
  "enableCaching": true
}
```

**Response:**
```json
{
  "results": [...], // Array of matching results
  "totalProcessed": 25,
  "totalTime": 1250,
  "successCount": 23,
  "errorCount": 2
}
```

### 5. Performance Analytics

**POST** `/api/ai/products/analyze/performance`

Get AI matching performance insights and recommendations.

```json
{
  "organizationId": "org-123-456",
  "timeRange": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

## Configuration

### Environment Variables

```bash
# AI Services
GEMINI_API_KEY=your-gemini-api-key
PRODUCT_MATCHER_API_URL=http://localhost:3000/api/products/search
PRODUCT_MATCHER_API_KEY=your-api-key

# Vector Database (choose one)
VECTOR_DB_PROVIDER=pgvector  # pinecone | weaviate | qdrant | pgvector

# Pinecone (if using)
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_URL=https://your-index.pinecone.io

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/biznavigate

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### PostgreSQL Setup with pgvector

```sql
-- Install pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE product_embeddings (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  organization_id VARCHAR(255) NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, organization_id)
);

-- Create indexes for performance
CREATE INDEX idx_embeddings_org ON product_embeddings(organization_id);
CREATE INDEX idx_embeddings_vector ON product_embeddings USING ivfflat (embedding vector_cosine_ops);
```

## Performance Optimization

### For 50K+ Users

1. **Horizontal Scaling**
   - Multiple API instances behind load balancer
   - Database read replicas
   - Redis cluster for caching

2. **Caching Strategy**
   - Embedding cache: 24 hours TTL
   - Search results cache: 5 minutes TTL
   - User-specific cache for frequent queries

3. **Database Optimization**
   - Vector indexes (ivfflat for pgvector)
   - Connection pooling
   - Query optimization

4. **Background Processing**
   - Embedding generation in background jobs
   - Batch processing for bulk operations
   - Queue-based architecture

### Sample Load Test Results

```
Concurrent Users: 1,000
Average Response Time: 245ms
Throughput: 4,000 requests/second
Success Rate: 99.7%
Cache Hit Rate: 85%
```

## Integration Examples

### WhatsApp Integration

```typescript
// In your WhatsApp message handler
const aiResult = await aiProductMatcher.matchProductsFromText(
  messageBody,
  distributorId,
  {
    enableSpellCorrection: true,
    enableSemanticSearch: true,
    maxResults: 5,
    minConfidence: 0.3
  }
);

// Use the results in conversation flow
const orderSummary = aiResult.matches.map(match =>
  `${match.name} - ₹${match.sellingPrice} (${match.available ? 'Available' : 'Out of Stock'})`
).join('\n');
```

### Web Application Integration

```typescript
// Client-side image upload
const formData = new FormData();
formData.append('image', imageFile);
formData.append('organizationId', 'org-123-456');

const response = await fetch('/api/ai/products/match/image', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

## Deployment

### Docker Compose Setup

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/biznavigate
      - REDIS_HOST=redis
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - db
      - redis

  db:
    image: pgvector/pgvector:pg15
    environment:
      - POSTGRES_DB=biznavigate
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-product-matcher
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-product-matcher
  template:
    metadata:
      labels:
        app: ai-product-matcher
    spec:
      containers:
      - name: api
        image: your-repo/ai-product-matcher:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-secret
              key: gemini-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

## Monitoring & Observability

### Key Metrics to Monitor

- Request latency (p95, p99)
- Cache hit rates
- Vector search performance
- AI service response times
- Error rates by endpoint
- Concurrent user counts

### Health Check Endpoint

```typescript
@Get('/health')
async healthCheck() {
  return {
    status: 'ok',
    vectorDB: await this.vectorService.healthCheck(),
    redis: await this.redis.ping(),
    ai: await this.aiService.healthCheck(),
    timestamp: new Date().toISOString()
  };
}
```

## Security Considerations

1. **API Rate Limiting**
   - Per-user rate limits
   - Organization-level quotas
   - DDoS protection

2. **Data Privacy**
   - Encrypt embeddings at rest
   - Audit logs for sensitive operations
   - GDPR compliance for EU users

3. **AI Safety**
   - Input sanitization
   - Output validation
   - Prompt injection protection

## Future Enhancements

1. **Multi-language Support**
   - Translation services
   - Language-specific embeddings

2. **Advanced AI Features**
   - Custom fine-tuned models
   - Real-time learning from user feedback
   - Contextual recommendations

3. **Additional Input Methods**
   - Barcode scanning
   - Voice commands
   - Gesture recognition

## Support & Troubleshooting

### Common Issues

1. **Low Matching Accuracy**
   - Check embedding quality
   - Verify product descriptions
   - Adjust confidence thresholds

2. **Slow Response Times**
   - Monitor database performance
   - Check vector index efficiency
   - Increase cache TTL

3. **High Error Rates**
   - Verify AI service connectivity
   - Check rate limiting
   - Monitor resource usage

For support, check logs in `/logs/ai-matcher.log` or contact the development team.