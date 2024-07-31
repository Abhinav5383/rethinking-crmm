import { type ContextUserSession, ctxReqAuthSessionKey, ctxReqBodyKey } from "@/../types";
import { getOAuthSignInUrl } from "@/controllers/auth/commons";
import { logOutUserSession } from "@/controllers/auth/session";
import { oAuthSignInHandler } from "@/controllers/auth/signin";
import { oAuthSignUpHandler } from "@/controllers/auth/signup";
import { LoginProtectedRoute } from "@/middleware/session";
import { getCurrSessionFromCtx } from "@/utils";
import getHttpCode, { defaultInvalidReqResponse, defaultServerErrorResponse } from "@/utils/http";
import { getAuthProviderFromString, getUserRoleFromString } from "@shared/lib/utils/convertors";
import { AuthActionIntent, type LoggedInUserData } from "@shared/types";
import { type Context, Hono } from "hono";

const authRouter = new Hono();

authRouter.get("/me", async (ctx: Context) => {
    try {
        const userSession = ctx.get(ctxReqAuthSessionKey) as ContextUserSession | undefined;

        if (!userSession) return ctx.json({ message: "You're not logged in!" }, getHttpCode("unauthenticated"));
        const formattedObject: LoggedInUserData = {
            id: userSession.id,
            email: userSession.email,
            fullName: userSession.fullName,
            userName: userSession.userName,
            role: getUserRoleFromString(userSession.role),
            hasAPassword: !!userSession.password,
            avatarImageUrl: userSession.avatarImageUrl,
            avatarProvider: getAuthProviderFromString(userSession?.avatarImageProvier || ""),
            sessionId: userSession.sessionId,
            sessionToken: userSession.sessionToken,
        };

        return ctx.json(formattedObject, getHttpCode("ok"));
    } catch (error) {
        console.error(error);
        return defaultServerErrorResponse(ctx);
    }
});

authRouter.get(`/${AuthActionIntent.SIGN_IN}/get-oauth-url/:authProvider`, async (ctx: Context) => {
    try {
        const url = getOAuthSignInUrl(ctx, ctx.req.param("authProvider"), AuthActionIntent.SIGN_IN);
        return ctx.json({ url }, getHttpCode("ok"));
    } catch (error) {
        return defaultServerErrorResponse(ctx);
    }
});

authRouter.get(`/${AuthActionIntent.SIGN_UP}/get-oauth-url/:authProvider`, async (ctx: Context) => {
    try {
        const url = getOAuthSignInUrl(ctx, ctx.req.param("authProvider"), AuthActionIntent.SIGN_UP);
        return ctx.json({ url }, getHttpCode("ok"));
    } catch (error) {
        return defaultServerErrorResponse(ctx);
    }
});

authRouter.get(`/callback/${AuthActionIntent.SIGN_IN}/:authProvider`, async (ctx: Context) => {
    try {
        if (ctx.get(ctxReqAuthSessionKey)?.id) {
            return defaultInvalidReqResponse(ctx);
        }

        const authProvider = ctx.req.param("authProvider");
        const code = decodeURIComponent(ctx.req.query("code") || "");
        return await oAuthSignInHandler(ctx, authProvider, code);
    } catch (error) {
        console.error(error);
        return defaultServerErrorResponse(ctx);
    }
});

authRouter.get(`/callback/${AuthActionIntent.SIGN_UP}/:authProvider`, async (ctx: Context) => {
    try {
        if (ctx.get(ctxReqAuthSessionKey)?.id) {
            return defaultInvalidReqResponse(ctx);
        }

        const authProvider = ctx.req.param("authProvider");
        const code = decodeURIComponent(ctx.req.query("code") || "");
        return await oAuthSignUpHandler(ctx, authProvider, code);
    } catch (error) {
        console.error(error);
        return defaultServerErrorResponse(ctx);
    }
});

authRouter.post("/session/logout", LoginProtectedRoute, async (ctx: Context) => {
    try {
        const authSession = getCurrSessionFromCtx(ctx);
        if (!authSession?.id) return ctx.json({}); // This shouldn't happen because the LoginProtectedRoute middleware should filter non logged in requests

        const targetSessionId = ctx.get(ctxReqBodyKey)?.sessionId || null;
        const targetSessionIdInt = Number.parseInt(targetSessionId || "0");
        if ((!targetSessionIdInt && targetSessionIdInt !== 0) || Number.isNaN(targetSessionIdInt) || targetSessionIdInt < 0) {
            return defaultInvalidReqResponse(ctx, "Invalid sessionId");
        }

        return await logOutUserSession(ctx, targetSessionIdInt);
    } catch (error) {
        console.error(error);
        return defaultServerErrorResponse(ctx);
    }
});

export default authRouter;
