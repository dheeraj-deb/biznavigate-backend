-- src/utils/tokenBucket.lua
-- KEYS[1] = bucketKey
-- ARGV[1] = capacity
-- ARGV[2] = refillPerSecond
-- ARGV[3] = nowMillis
-- ARGV[4] = tokensRequested

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refillPerSecond = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local tokensRequested = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(data[1])
local last_refill = tonumber(data[2])

if tokens == nil then
  tokens = capacity
  last_refill = now
end

-- Refill
local delta_ms = now - last_refill
if delta_ms > 0 then
  local refillTokens = (delta_ms / 1000) * refillPerSecond
  tokens = math.min(capacity, tokens + refillTokens)
  last_refill = now
end

if tokens >= tokensRequested then
  tokens = tokens - tokensRequested
  redis.call('HMSET', key, 'tokens', tostring(tokens), 'last_refill', tostring(last_refill))
  -- set TTL to 10 seconds so unused buckets auto-expire
  redis.call('EXPIRE', key, 10)
  return 1
else
  -- persist new values
  redis.call('HMSET', key, 'tokens', tostring(tokens), 'last_refill', tostring(last_refill))
  redis.call('EXPIRE', key, 10)
  return 0
end
