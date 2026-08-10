const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : 0,
});

async function scanAndDelete(pattern) {
  console.log(`Scanning for keys: ${pattern}`);
  let deleted = 0;
  const stream = redis.scanStream({ match: pattern, count: 100 });

  for await (const keys of stream) {
    if (keys.length) {
      // delete in batches
      try {
        await redis.del(...keys);
        deleted += keys.length;
        console.log(`  Deleted ${keys.length} keys`);
      } catch (e) {
        console.error('  Error deleting keys batch:', e.message || e);
      }
    }
  }

  return deleted;
}

(async () => {
  try {
    const patterns = ['seat_lock:*', 'reservation:*'];
    let total = 0;
    for (const p of patterns) {
      const n = await scanAndDelete(p);
      console.log(`Pattern ${p}: deleted ${n} keys`);
      total += n;
    }

    console.log(`Done. Total deleted keys: ${total}`);
    await redis.quit();
    process.exit(0);
  } catch (err) {
    console.error('Fatal error cleaning redis keys:', err);
    try { await redis.quit(); } catch(_){}
    process.exit(2);
  }
})();
