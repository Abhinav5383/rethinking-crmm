import {
    addNewPassword,
    cancelAddingNewPassword,
    confirmAddingNewPassword,
    getConfirmActionTypeFromCode,
    sendAccountPasswordChangeLink,
    removeAccountPassword,
    cancelSettingNewPassword,
    setNewPassword,
} from "@/controllers/user/account";
import { getLinkedAuthProviders, updateUserProfile } from "@/controllers/user/profile";
import { LoginProtectedRoute } from "@/middleware/session";
import httpCode, { defaultInvalidReqResponse, defaultServerErrorResponse } from "@/utils/http";
import { parseValueToSchema } from "@shared/schemas";
import {
    setNewPasswordFormSchema,
    sendAccoutPasswordChangeLinkFormSchema,
    profileUpdateFormSchema,
    removeAccountPasswordFormSchema,
} from "@shared/schemas/settings";
import { type Context, Hono } from "hono";
import { ctxReqBodyKey } from "../../types";

const userRouter = new Hono();

userRouter.post("/update-profile", LoginProtectedRoute, async (ctx: Context) => {
    try {
        const { data, error } = parseValueToSchema(profileUpdateFormSchema, ctx.get(ctxReqBodyKey));
        if (error || !data) {
            return ctx.json({ success: false, message: error }, httpCode("bad_request"));
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
        const { data, error } = parseValueToSchema(setNewPasswordFormSchema, ctx.get(ctxReqBodyKey));
        if (error || !data) {
            return ctx.json({ success: false, message: error }, httpCode("bad_request"));
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
            return ctx.json({ success: false }, httpCode("bad_request"));
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
            return ctx.json({ success: false }, httpCode("bad_request"));
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
            return ctx.json({ success: false }, httpCode("bad_request"));
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
            return ctx.json({ success: false, message: error }, httpCode("bad_request"));
        }
        return await removeAccountPassword(ctx, data);
    } catch (err) {
        console.error(err);
        return defaultServerErrorResponse(ctx);
    }
});

userRouter.post("/send-password-change-email", async (ctx: Context) => {
    try {
        const { data, error } = parseValueToSchema(sendAccoutPasswordChangeLinkFormSchema, ctx.get(ctxReqBodyKey));
        if (error || !data) {
            return ctx.json({ success: false, message: error }, httpCode("bad_request"));
        }
        return await sendAccountPasswordChangeLink(ctx, data);
    } catch (err) {
        console.error(err);
        return defaultServerErrorResponse(ctx);
    }
});

userRouter.post("/cancel-settings-new-password", async (ctx: Context) => {
    try {
        const code = ctx.get(ctxReqBodyKey)?.code;
        if (!code) {
            return defaultInvalidReqResponse(ctx);
        }
        return await cancelSettingNewPassword(ctx, code);
    } catch (err) {
        console.error(err);
        return defaultServerErrorResponse(ctx);
    }
});

userRouter.post("/set-new-password", async (ctx: Context) => {
    try {
        const { data, error } = parseValueToSchema(setNewPasswordFormSchema, ctx.get(ctxReqBodyKey));
        if (error || !data) {
            return ctx.json({ success: false, message: error }, httpCode("bad_request"));
        }
        const code = ctx.get(ctxReqBodyKey)?.code;
        if (!code) {
            return defaultInvalidReqResponse(ctx);
        }
        return await setNewPassword(ctx, code, data);
    } catch (err) {
        console.error(err);
        return defaultServerErrorResponse(ctx);
    }
});

export default userRouter;
