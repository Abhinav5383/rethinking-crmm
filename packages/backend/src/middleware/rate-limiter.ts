import { getUserIpAddress } from "@/controllers/auth/commons";
import redis from "@/services/redis";
import getHttpCode from "@/utils/http";
import type { Context, Next } from "hono";

export const RateLimiterMiddleware = async (ctx: Context, next: Next) => {
    try {
        const ipAddr = getUserIpAddress(ctx);
        const key = `rateLimit:${ipAddr}`;

        let count = Number.parseInt(await redis.get(key) || "-1");
        if (count === -1) {
            await redis.set(key, 1, "EX", rateLimits.global.timeWindow_s);
            count = 1;
        } else if (count < rateLimits.global.limit) {
            await redis.incr(key);
        }

        ctx.res.headers.set("X-Ratelimit-Remaining", `${Math.max(rateLimits.global.limit - count, 0)}`)
        ctx.res.headers.set("X-Ratelimit-Limit", `${rateLimits.global.limit}`)
        ctx.res.headers.set("X-Ratelimit-Reset", `${rateLimits.global.timeWindow_s}`)

        if (count > rateLimits.global.limit) {
            return ctx.json({ success: false, message: "Rate limit exceeded, please try again after 5 minutes" }, getHttpCode("too_many_requests"));
        }

    } catch (error) {
        console.error(error)
    }
    await next();
}

const rateLimits = {
    global: {
        limit: 1500,
        timeWindow_s: 360
    }
}