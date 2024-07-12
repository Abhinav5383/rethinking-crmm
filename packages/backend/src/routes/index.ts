import { getOAuthSignInUrl } from "@/controllers/auth/commons";
import { oAuthSignInHandler } from "@/controllers/auth/signin";
import { oAuthSignUpHandler } from "@/controllers/auth/signup";
import bodyParserMiddleware from "@/middleware/parse-body";
import { RateLimiterMiddleware } from "@/middleware/rate-limiter";
import { AuthenticationMiddleware } from "@/middleware/session";
import getHttpCode, { defaultInvalidReqResponse, defaultServerErrorResponse } from "@/utils/http";
import { type Context, Hono } from "hono";
import { AuthActionIntent } from "../../types";

const router = new Hono();

// MIDDLEWARES
router.use("*", bodyParserMiddleware);
router.use("*", RateLimiterMiddleware);
router.use("*", AuthenticationMiddleware);

// TEST API
router.get("/", async (ctx: Context) => {
    return ctx.json({ hi: "HI", x: ctx.get("user-session"), y: ctx.get("ip") })
})


// AUTH
router.get(`/auth/${AuthActionIntent.SIGN_IN}/get-oauth-url/:authProvider`, async (ctx: Context) => {
    try {
        const url = getOAuthSignInUrl(ctx, ctx.req.param("authProvider"), AuthActionIntent.SIGN_IN);
        return ctx.json({ url }, getHttpCode("ok"));

    } catch (error) {
        return defaultServerErrorResponse(ctx);
    }
})

router.get(`/auth/${AuthActionIntent.SIGN_UP}/get-oauth-url/:authProvider`, async (ctx: Context) => {
    try {
        const url = getOAuthSignInUrl(ctx, ctx.req.param("authProvider"), AuthActionIntent.SIGN_UP);
        return ctx.json({ url }, getHttpCode("ok"));

    } catch (error) {
        return defaultServerErrorResponse(ctx);
    }
})

router.get(`/auth/callback/${AuthActionIntent.SIGN_IN}/:authProvider`, async (ctx: Context) => {
    try {
        if (ctx.get("user-session")?.id) {
            return defaultInvalidReqResponse(ctx);
        }

        const authProvider = ctx.req.param("authProvider");
        const code = decodeURIComponent(ctx.req.query("code") || "");
        return await oAuthSignInHandler(ctx, authProvider, code);
    } catch (error) {
        console.error(error);
        return defaultServerErrorResponse(ctx);
    }
})

router.get(`/auth/callback/${AuthActionIntent.SIGN_UP}/:authProvider`, async (ctx: Context) => {
    try {
        if (ctx.get("user-session")?.id) {
            return defaultInvalidReqResponse(ctx);
        }

        const authProvider = ctx.req.param("authProvider");
        const code = decodeURIComponent(ctx.req.query("code") || "");
        return await oAuthSignUpHandler(ctx, authProvider, code);
    } catch (error) {
        console.error(error);
        return defaultServerErrorResponse(ctx);
    }
})



export default router;