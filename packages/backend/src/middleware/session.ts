import { getUserIpAddress } from "@/controllers/auth/commons";
import { getUserSession } from "@/controllers/auth/session";
import { deleteUserCookie, generateRandomString, setUserCookie } from "@/utils";
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { ctxReqAuthSessionKey } from "../../types";

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
        deleteUserCookie(ctx, "guest-session")
    }

    ctx.set(ctxReqAuthSessionKey, user);
    ctx.set("ip", ipAddr);
    await next();
}