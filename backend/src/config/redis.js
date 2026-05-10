const Redis = require('ioredis');

let redis;

function getRedisClient() {
  if (!redis) {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    redis = new Redis(url, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: false
    });

    redis.on('error', (error) => {
      console.error('Redis error:', error.message);
    });
  }

  return redis;
}

module.exports = getRedisClient;
