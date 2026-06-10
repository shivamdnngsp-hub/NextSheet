import redis from "@/lib/redis";

export const rateLimiter = async (
  key: string,
  limit: number,
  windowSec: number
) => {

  const now = Date.now();
 
  const windowStart = now - windowSec * 1000;


  await redis.zremrangebyscore(key, 0, windowStart);

  
  const current = await redis.zcard(key);


  if (current >= limit) {

  
    const oldest = await redis.zrange( key, 0,0,"WITHSCORES");

   
    const retryAfter = Math.ceil((Number(oldest[1]) + windowSec * 1000 - now) / 1000);

    return {
      success: false,
      remaining: 0,
      retryAfter,
    };
  }


  await redis.zadd(key, now, `${now}-${Math.random()}`);


  await redis.expire(key, windowSec);

  return {
    success: true,
    remaining: limit - current - 1,
    retryAfter: windowSec,
  };
};