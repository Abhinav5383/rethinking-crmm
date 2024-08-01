import prisma from "@/services/prisma";
import { getCurrSessionFromCtx } from "@/utils";
import httpCode from "@/utils/http";
import { formatUserName } from "@shared/lib/utils";
import type { profileUpdateFormSchema } from "@shared/schemas/settings";
import type { LinkedProvidersListData } from "@shared/types";
import type { Context } from "hono";
import type { z } from "zod";

export const updateUserProfile = async (ctx: Context, profileData: z.infer<typeof profileUpdateFormSchema>) => {
    const userSession = getCurrSessionFromCtx(ctx);
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
            userNameLowerCase: profileData.userName.toLowerCase(),
            avatarImageProvier: profileData.avatarImageProvider,
            avatarImageUrl: avatarImageUrl,
        },
    });
    return ctx.json({ success: true, message: "Profile updated successfully", profileData }, httpCode("ok"));
};

export const getLinkedAuthProviders = async (ctx: Context) => {
    const userSession = getCurrSessionFromCtx(ctx);
    if (!userSession) return ctx.json({}, httpCode("bad_request"));

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
