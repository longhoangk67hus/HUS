#!/usr/bin/env node
const Redis = require('ioredis');

const {
  REDIS_HOST = '127.0.0.1',
  REDIS_PORT = '6379',
  REDIS_PASSWORD,
  REDIS_DB = '0',
} = process.env;

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/clear_locks.js <showtimeId> [--dry-run]');
  process.exit(1);
}

const showtimeId = args[0];
const dryRun = args.includes('--dry-run');

const redis = new Redis({
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT, 10),
  password: REDIS_PASSWORD || undefined,
  db: parseInt(REDIS_DB, 10),
});

async function clearLocks(showtimeId) {
  const pattern = `seat_lock:${showtimeId}:*`;
  console.log(`Scanning keys matching: ${pattern}`);

  const stream = redis.scanStream({ match: pattern, count: 100 });
  let total = 0;
  const toDelete = [];

  for await (const keys of stream) {
    if (keys.length) {
      if (dryRun) {
        keys.forEach((k) => console.log('FOUND', k));
      } else {
        toDelete.push(...keys);
      }
      total += keys.length;
    }
  }

  if (dryRun) {
    console.log(`Found ${total} matching keys (dry-run)`);
    return total;
  }

  if (toDelete.length === 0) {
    console.log('No keys to delete');
    return 0;
  }

  // Delete in batches to avoid argument limits
  const batchSize = 500;
  let deleted = 0;
  for (let i = 0; i < toDelete.length; i += batchSize) {
    const batch = toDelete.slice(i, i + batchSize);
    const res = await redis.del(...batch);
    deleted += res;
    console.log(`Deleted batch ${i / batchSize + 1}: ${res} keys`);
  }

  console.log(`Total deleted keys: ${deleted}`);
  return deleted;
}

clearLocks(showtimeId)
  .then(() => redis.quit())
  .catch((err) => {
    console.error('Error clearing locks:', err);
    redis.quit();
    process.exit(2);
  });
