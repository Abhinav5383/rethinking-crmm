import type { ContextUserSession } from "@/../types";
import { addToUsedRateLimit } from "@/middleware/rate-limiter";
import prisma from "@/services/prisma";
import { getUserSessionFromCtx } from "@/utils";
import httpCode, { defaultInvalidReqResponse } from "@/utils/http";
import { CHARGE_FOR_SENDING_INVALID_DATA } from "@shared/config/rate-limit-charges";
import { formatUserName } from "@shared/lib/utils";
import type { profileUpdateFormSchema } from "@shared/schemas/settings";
import type { LinkedProvidersListData } from "@shared/types";
import type { Context } from "hono";
import type { z } from "zod";

export const updateUserProfile = async (ctx: Context, profileData: z.infer<typeof profileUpdateFormSchema>) => {
    const userSession = getUserSessionFromCtx(ctx);
    if (!userSession) return ctx.json({}, httpCode("bad_request"));

    profileData.userName = formatUserName(profileData.userName);
    profileData.fullName = formatUserName(profileData.fullName, " ");

    const existingUserWithSameUserName =
        profileData.userName.toLowerCase() === userSession.userName.toLowerCase()
            ? null
            : !!(
                await prisma.user.findUnique({
                    where: {
                        userNameLowerCase: profileData.userName.toLowerCase(),
                        NOT: [{ id: userSession.id }],
                    },
                })
            )?.id;

    if (existingUserWithSameUserName) return ctx.json({ success: false, message: "Username already taken" }, httpCode("bad_request"));

    let avatarImageUrl = userSession.avatarImageUrl;
    if (userSession.avatarImageProvier !== profileData.avatarImageProvider) {
        const authAccount = await prisma.authAccount.findFirst({
            where: {
                userId: userSession.id,
                providerName: profileData.avatarImageProvider,
            },
        });

        if (!authAccount?.id) {
            await addToUsedRateLimit(ctx, CHARGE_FOR_SENDING_INVALID_DATA)
            return ctx.json({ success: false, message: "Invalid profile provider" }, httpCode("bad_request"));
        }

        avatarImageUrl = authAccount?.avatarImageUrl;
    }

    await prisma.user.update({
        where: {
            id: userSession.id,
        },
        data: {
            fullName: profileData.fullName,
            userName: profileData.userName,
            userNameLowerCase: profileData.userName.toLowerCase(),
            avatarImageProvier: profileData.avatarImageProvider,
            avatarImageUrl: avatarImageUrl,
        },
    });
    return ctx.json({ success: true, message: "Profile updated successfully", profileData }, httpCode("ok"));
};

export const getLinkedAuthProviders = async (ctx: Context, userSession: ContextUserSession) => {
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

    return ctx.json({ providers: providersList }, httpCode("ok"));
};

export const getAllSessions = async (ctx: Context, userSession: ContextUserSession) => {
    const sessions = await prisma.userSession.findMany({
        where: {
            userId: userSession.id
        },
        orderBy: { dateCreated: "desc" }
    });

    if (!sessions?.[0]?.id) {
        return defaultInvalidReqResponse(ctx);
    }

    for (const session of sessions) {
        session.revokeAccessCode = "";
    }

    return ctx.json({ success: true, sessions: sessions }, httpCode("ok"));
}