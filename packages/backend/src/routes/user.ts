import { type Context, Hono } from "hono";
import { ctxReqBodyKey } from "../../types";
import { addPasswordFormSchema, profileUpdateFormSchema } from "@shared/schemas/settings";
import { parseValueToSchema } from "@shared/schemas";
import getHttpCode, { defaultServerErrorResponse } from "@/utils/http";
import { addNewPassword, getLinkedAuthProviders, updateUserProfile } from "@/controllers/user/profile";
import { LoginProtectedRoute } from "@/middleware/session";

const userRouter = new Hono();

userRouter.post("/update-profile", LoginProtectedRoute, async (ctx: Context) => {
    try {
        const { data, error } = parseValueToSchema(profileUpdateFormSchema, ctx.get(ctxReqBodyKey));
        if (error || !data) {
            return ctx.json({ error: error }, getHttpCode("bad_request"));
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
            return ctx.json({ error: error }, getHttpCode("bad_request"));
        }

        return await addNewPassword(ctx, data);
    } catch (err) {
        console.error(err);
        return defaultServerErrorResponse(ctx);
    }
});

export default userRouter;
