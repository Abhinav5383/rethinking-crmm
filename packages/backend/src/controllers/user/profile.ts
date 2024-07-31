import prisma from "@/services/prisma";
import { getCurrSessionFromCtx } from "@/utils";
import getHttpCode from "@/utils/http";
import type { addPasswordFormSchema, profileUpdateFormSchema } from "@shared/schemas/settings";
import type { LinkedProvidersListData } from "@shared/types";
import type { Context } from "hono";
import type { z } from "zod";

export const updateUserProfile = async (ctx: Context, profileData: z.infer<typeof profileUpdateFormSchema>) => {
    const userSession = getCurrSessionFromCtx(ctx);
    if (!userSession) return ctx.json({}, getHttpCode("bad_request"));

    let avatarImageUrl = userSession.avatarImageUrl;

    if (userSession.avatarProvider !== profileData.avatarImageProvider) {
        const authAccount = await prisma.authAccount.findFirst({
            where: {
                userId: userSession.id,
                providerName: profileData.avatarImageProvider,
            },
        });

        avatarImageUrl = authAccount?.avatarImageUrl;
    }

    await prisma.user.update({
        where: {
            id: userSession.id,
        },
        data: {
            fullName: profileData.fullName,
            userName: profileData.userName,
            avatarImageProvier: profileData.avatarImageProvider,
            avatarImageUrl: avatarImageUrl,
        },
    });
    return ctx.json({ success: true, message: "Profile updated successfully", profileData }, getHttpCode("ok"));
};

export const getLinkedAuthProviders = async (ctx: Context) => {
    const userSession = getCurrSessionFromCtx(ctx);
    if (!userSession) return ctx.json({}, getHttpCode("bad_request"));

    const linkedProviders = await prisma.authAccount.findMany({
        where: {
            userId: userSession.id,
        },
    });

    const providersList: LinkedProvidersListData[] = [];
    for (const provider of linkedProviders) {
        providersList.push({
            id: provider.id,
            providerName: provider.providerName,
            providerAccountId: provider.providerAccountId,
            providerAccountEmail: provider.providerAccountEmail,
            avatarImageUrl: provider.avatarImageUrl,
        });
    }

    return ctx.json(providersList);
};

export const addNewPassword = async (ctx: Context, formData: z.infer<typeof addPasswordFormSchema>) => {
    const userSession = getCurrSessionFromCtx(ctx);
    if (!userSession || userSession.hasAPassword === true) return ctx.json({}, getHttpCode("bad_request"));

    // Get the hashed password

    // await prisma.user.update({
    //     where: {
    //         id: userSession.id,
    //     },
    //     data: {
    //         unverifiedNewPassword: "",
    //     },
    // });

    return ctx.json({ message: "Confirmation email sent.", success: true }, getHttpCode("ok"));
};
