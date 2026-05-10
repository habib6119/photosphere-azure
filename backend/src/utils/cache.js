const getRedisClient = require('../config/redis');

const DEFAULT_TTL_SECONDS = 60;

async function getCachedJson(key) {
  const redis = getRedisClient();
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

async function setCachedJson(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const redis = getRedisClient();
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

async function deleteByPattern(pattern) {
  const redis = getRedisClient();
  let cursor = '0';

  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = nextCursor;
    if (keys.length) {
      await redis.del(...keys);
    }
  } while (cursor !== '0');
}

module.exports = {
  getCachedJson,
  setCachedJson,
  deleteByPattern,
  DEFAULT_TTL_SECONDS
};
