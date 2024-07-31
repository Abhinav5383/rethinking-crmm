import {
    addNewPassword,
    cancelAddingNewPassword,
    confirmAddingNewPassword,
    getConfirmActionTypeFromCode,
    removeAccountPassword,
} from "@/controllers/user/account";
import { getLinkedAuthProviders, updateUserProfile } from "@/controllers/user/profile";
import { LoginProtectedRoute } from "@/middleware/session";
import getHttpCode, { defaultServerErrorResponse } from "@/utils/http";
import { parseValueToSchema } from "@shared/schemas";
import { addPasswordFormSchema, profileUpdateFormSchema, removeAccountPasswordFormSchema } from "@shared/schemas/settings";
import { type Context, Hono } from "hono";
import { ctxReqBodyKey } from "../../types";

const userRouter = new Hono();

userRouter.post("/update-profile", LoginProtectedRoute, async (ctx: Context) => {
    try {
        const { data, error } = parseValueToSchema(profileUpdateFormSchema, ctx.get(ctxReqBodyKey));
        if (error || !data) {
            return ctx.json({ success: false, message: error }, getHttpCode("bad_request"));
        }
        return updateUserProfile(ctx, data);
    } catch (err) {
        console.error(err);
        return defaultServerErrorResponse(ctx);
    }
});

userRouter.get("/get-linked-auth-providers", LoginProtectedRoute, async (ctx: Context) => {
    try {
        return await getLinkedAuthProviders(ctx);
    } catch (err) {
        console.error(err);
        return defaultServerErrorResponse(ctx);
    }
});

userRouter.post("/add-new-password", LoginProtectedRoute, async (ctx: Context) => {
    try {
        const { data, error } = parseValueToSchema(addPasswordFormSchema, ctx.get(ctxReqBodyKey));
        if (error || !data) {
            return ctx.json({ success: false, message: error }, getHttpCode("bad_request"));
        }
        return await addNewPassword(ctx, data);
    } catch (err) {
        console.error(err);
        return defaultServerErrorResponse(ctx);
    }
});

userRouter.post("/get-confirm-action-type", async (ctx: Context) => {
    try {
        const code = ctx.get(ctxReqBodyKey)?.code;
        if (!code) {
            return ctx.json({ success: false }, getHttpCode("bad_request"));
        }
        return await getConfirmActionTypeFromCode(ctx, code);
    } catch (err) {
        console.error(err);
        return defaultServerErrorResponse(ctx);
    }
});

userRouter.post("/cancel-adding-new-password", async (ctx: Context) => {
    try {
        const code = ctx.get(ctxReqBodyKey)?.code;
        if (!code) {
            return ctx.json({ success: false }, getHttpCode("bad_request"));
        }
        return await cancelAddingNewPassword(ctx, code);
    } catch (err) {
        console.error(err);
        return defaultServerErrorResponse(ctx);
    }
});

userRouter.post("/confirm-adding-new-password", async (ctx: Context) => {
    try {
        const code = ctx.get(ctxReqBodyKey)?.code;
        if (!code) {
            return ctx.json({ success: false }, getHttpCode("bad_request"));
        }
        return await confirmAddingNewPassword(ctx, code);
    } catch (err) {
        console.error(err);
        return defaultServerErrorResponse(ctx);
    }
});

userRouter.post("/remove-account-password", LoginProtectedRoute, async (ctx: Context) => {
    try {
        const { data, error } = parseValueToSchema(removeAccountPasswordFormSchema, ctx.get(ctxReqBodyKey));
        if (error || !data) {
            return ctx.json({ success: false, message: error }, getHttpCode("bad_request"));
        }
        return await removeAccountPassword(ctx, data);
    } catch (err) {
        console.error(err);
        return defaultServerErrorResponse(ctx);
    }
});

export default userRouter;
