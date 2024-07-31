import { getUserIpAddress } from "@/controllers/auth/commons";
import { getUserSession } from "@/controllers/auth/session";
import { deleteUserCookie, generateRandomString, getCurrSessionFromCtx, setUserCookie } from "@/utils";
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { ctxReqAuthSessionKey } from "../../types";
import getHttpCode, { defaultServerErrorResponse } from "@/utils/http";
import { addToUsedRateLimit } from "./rate-limiter";
import { PROTECTED_ROUTE_ACCESS_ATTEMPT_CHARGE } from "@shared/config/rate-limit-charges";

export const AuthenticationMiddleware = async (ctx: Context, next: Next) => {
    const user = await getUserSession(ctx);
    const ipAddr = getUserIpAddress(ctx);

    if (!user) {
        if (!getCookie(ctx, "guest-session")) {
            const code = generateRandomString(32);
            setUserCookie(ctx, "guest-session", code);
            ctx.set("guest-session", code);
        } else {
            ctx.set("guest-session", getCookie(ctx, "guest-session"));
        }
    } else {
        deleteUserCookie(ctx, "guest-session");
    }

    ctx.set(ctxReqAuthSessionKey, user);
    ctx.set("ip", ipAddr);
    await next();
};

export const LoginProtectedRoute = async (ctx: Context, next: Next) => {
    try {
        const session = getCurrSessionFromCtx(ctx);
        if (!session?.id) {
            await addToUsedRateLimit(ctx, PROTECTED_ROUTE_ACCESS_ATTEMPT_CHARGE);
            return ctx.json({ success: false, message: "You're not logged in" }, getHttpCode("unauthenticated"));
        }

        await next();
    } catch (error) {
        console.error(error);
        return defaultServerErrorResponse(ctx);
    }
};
