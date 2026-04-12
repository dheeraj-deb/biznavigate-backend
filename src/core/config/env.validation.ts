import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // ── App ─────────────────────────────────────────────────────────────────────
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(8000),

  // ── Database ─────────────────────────────────────────────────────────────────
  DATABASE_URL: Joi.string().required(),

  // ── Auth ─────────────────────────────────────────────────────────────────────
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  ENCRYPTION_KEY: Joi.string().min(32).required(),

  // ── Redis ─────────────────────────────────────────────────────────────────────
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),
  REDIS_TLS: Joi.boolean().default(false),
  REDIS_DB: Joi.number().default(0),

  // ── MongoDB (optional) ────────────────────────────────────────────────────────
  MONGODB_URI: Joi.string().optional().allow(''),

  // ── Kafka ─────────────────────────────────────────────────────────────────────
  KAFKA_BROKERS: Joi.string().default('localhost:9093'),
  KAFKA_CLIENT_ID: Joi.string().default('biznavigate-backend'),
  KAFKA_GROUP_ID: Joi.string().default('biznavigate-backend-group'),

  // ── AWS S3 (optional) ─────────────────────────────────────────────────────────
  AWS_REGION: Joi.string().optional().allow(''),
  AWS_ACCESS_KEY_ID: Joi.string().optional().allow(''),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional().allow(''),
  AWS_S3_BUCKET_NAME: Joi.string().optional().allow(''),

  // ── WhatsApp (optional) ───────────────────────────────────────────────────────
  WHATSAPP_API_VERSION: Joi.string().default('v21.0'),
  WHATSAPP_BUSINESS_ACCOUNT_ID: Joi.string().optional().allow(''),
  WHATSAPP_PHONE_NUMBER_ID: Joi.string().optional().allow(''),

  // ── Facebook / Instagram (optional) ──────────────────────────────────────────
  FACEBOOK_APP_ID: Joi.string().optional().allow(''),
  FACEBOOK_APP_SECRET: Joi.string().optional().allow(''),
  FACEBOOK_WEBHOOK_VERIFY_TOKEN: Joi.string().optional().allow(''),

  // ── OpenAI / AI (optional) ────────────────────────────────────────────────────
  GEMINI_API_KEY: Joi.string().optional().allow(''),

  // ── Sentry (optional) ────────────────────────────────────────────────────────
  SENTRY_DSN: Joi.string().optional().allow(''),
  SENTRY_TRACES_SAMPLE_RATE: Joi.number().min(0).max(1).default(0.1),

  // ── CORS ─────────────────────────────────────────────────────────────────────
  ALLOWED_ORIGINS: Joi.string().optional().allow(''),
  API_URL: Joi.string().optional().allow(''),
}).options({ allowUnknown: true });
