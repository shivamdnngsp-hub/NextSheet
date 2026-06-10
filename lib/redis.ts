import Redis from "ioredis"
declare global{
    var redis: Redis | undefined
}

const redis = global.redis || new Redis(process.env.REDIS_URL as string )

global.redis = redis 
export default redis
