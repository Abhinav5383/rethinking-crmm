import { type ContextUserSession, ctxReqAuthSessionKey, ctxReqBodyKey } from "@/../types";
import { getOAuthSignInUrl } from "@/controllers/auth/commons";
import { logOutUserSession, revokeSessionFromAccessCode } from "@/controllers/auth/session";
import { oAuthSignInHandler } from "@/controllers/auth/signin";
import credentialSignIn from "@/controllers/auth/signin/credential";
import { oAuthSignUpHandler } from "@/controllers/auth/signup";
import { LoginProtectedRoute } from "@/middleware/session";
import { getCurrSessionFromCtx } from "@/utils";
import httpCode, { defaultInvalidReqResponse, defaultServerErrorResponse } from "@/utils/http";
import { getAuthProviderFromString, getUserRoleFromString } from "@shared/lib/utils/convertors";
import { parseValueToSchema } from "@shared/schemas";
import { LoginFormSchema } from "@shared/schemas/auth";
import { AuthActionIntent, AuthProviders, type LoggedInUserData } from "@shared/types";
import { type Context, Hono } from "hono";

const authRouter = new Hono();

authRouter.get("/me", async (ctx: Context) => {
    try {
        const userSession = ctx.get(ctxReqAuthSessionKey) as ContextUserSession | undefined;

        if (!userSession) return ctx.json({ message: "You're not logged in!" }, httpCode("unauthenticated"));
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

        return ctx.json(formattedObject, httpCode("ok"));
    } catch (error) {
        console.error(error);
        return defaultServerErrorResponse(ctx);
    }
});

authRouter.get(`/${AuthActionIntent.SIGN_IN}/get-oauth-url/:authProvider`, async (ctx: Context) => {
    try {
        const url = getOAuthSignInUrl(ctx, ctx.req.param("authProvider"), AuthActionIntent.SIGN_IN);
        return ctx.json({ url }, httpCode("ok"));
    } catch (error) {
        return defaultServerErrorResponse(ctx);
    }
});

authRouter.get(`/${AuthActionIntent.SIGN_UP}/get-oauth-url/:authProvider`, async (ctx: Context) => {
    try {
        const url = getOAuthSignInUrl(ctx, ctx.req.param("authProvider"), AuthActionIntent.SIGN_UP);
        return ctx.json({ url }, httpCode("ok"));
    } catch (error) {
        return defaultServerErrorResponse(ctx);
    }
});

authRouter.post(`/${AuthActionIntent.SIGN_IN}/${AuthProviders.CREDENTIAL}`, async (ctx: Context) => {
    try {
        const { data, error } = parseValueToSchema(LoginFormSchema, ctx.get(ctxReqBodyKey));
        if (error || !data) {
            return ctx.json({ success: false, message: error }, httpCode("bad_request"));
        }

        return await credentialSignIn(ctx, data);
        // return await sendAccountPasswordChangeLink(ctx, data);
    } catch (err) {
        console.error(err);
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
        if (!authSession?.id) return ctx.json({}, httpCode("bad_request")); // This shouldn't happen because the LoginProtectedRoute middleware should filter non logged in requests

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

authRouter.post("/session/revoke-from-code", async (ctx: Context) => {
    try {
        const code = ctx.get(ctxReqBodyKey)?.code;
        if (!code) return ctx.json({ success: false }, httpCode("bad_request"));

        return await revokeSessionFromAccessCode(ctx, code);
    } catch (err) {
        console.error(err);
        return defaultServerErrorResponse(ctx);
    }
});

export default authRouter;
