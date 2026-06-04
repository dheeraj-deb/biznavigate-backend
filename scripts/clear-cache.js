"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = require("ioredis");
async function clearCache() {
    const client = new ioredis_1.default({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    });
    try {
        console.log('Connected to Redis');
        const keys = await client.keys('user_active:*');
        console.log(`Found ${keys.length} cached user status keys`);
        if (keys.length > 0) {
            await client.del(...keys);
            console.log('✅ Cache cleared successfully');
        }
        else {
            console.log('✅ No cache entries to clear');
        }
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await client.quit();
    }
}
clearCache();
//# sourceMappingURL=clear-cache.js.map