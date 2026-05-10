import Redis, { Cluster } from "ioredis";

// Lazy singleton used by legacy callers (WhatsApp module).
// New code should inject RedisService instead.
let redisInstance: Redis | Cluster | null = null;

export function getRedis(): Redis | Cluster {
  if (redisInstance) return redisInstance;

  const useCluster = process.env.REDIS_CLUSTER === "true";
  if (useCluster) {
    const nodes = (process.env.REDIS_NODES || "localhost:6379")
      .split(",")
      .map((n) => {
        const [host, port] = n.split(":");
        return { host, port: parseInt(port) };
      });
    redisInstance = new Redis.Cluster(nodes);
  } else {
    redisInstance = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || "0", 10),
      maxRetriesPerRequest: 3,
    });
  }

  redisInstance.on("error", (err) =>
    console.error("[redis] connection error", err?.message ?? err)
  );

  // Clean up on process exit so the connection doesn't hang the process
  const cleanup = () => { redisInstance?.quit().catch(() => {}); };
  process.once("SIGTERM", cleanup);
  process.once("SIGINT", cleanup);

  return redisInstance;
}
