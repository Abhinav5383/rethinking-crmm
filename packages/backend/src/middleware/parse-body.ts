import type { Context, Next } from "hono";
import { ctxReqBodyKey } from "../../types";

const bodyParserMiddleware = async (ctx: Context, next: Next) => {
    try {
        ctx.set(ctxReqBodyKey, await ctx.req.json());
    } catch (error) { }
    await next();
}

export default bodyParserMiddleware;