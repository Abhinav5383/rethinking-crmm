import type { AuthUserProfile } from "@/../types";
import prisma from "@/services/prisma";
import { setUserCookie } from "@/utils";
import getHttpCode from "@/utils/http";
import { authTokenCookieName } from "@shared/config";
import { AuthProviders } from "@shared/types";
import type { Context } from "hono";
import { getDiscordUserProfileData } from "../discord";
import { getGithubUserProfileData } from "../github";
import { getGitlabUserProfileData } from "../gitlab";
import { getGoogleUserProfileData } from "../google";
import { createNewUserSession } from "../session";

export const oAuthSignInHandler = async (ctx: Context, authProvider: string, tokenExchangeCode: string) => {
    let profileData: AuthUserProfile | null;

    switch (authProvider) {
        case AuthProviders.GITHUB:
            profileData = await getGithubUserProfileData(tokenExchangeCode);
            break;
        case AuthProviders.GITLAB:
            profileData = await getGitlabUserProfileData(tokenExchangeCode);
            break;
        case AuthProviders.DISCORD:
            profileData = await getDiscordUserProfileData(tokenExchangeCode);
            break;
        case AuthProviders.GOOGLE:
            profileData = await getGoogleUserProfileData(tokenExchangeCode);
            break;
        default:
            profileData = null;
    }

    if (!profileData || !profileData?.email || !profileData?.providerName || !profileData?.providerAccountId) {
        return ctx.json(
            {
                message: "Invalid profile data received from the auth provider, most likely the code provided was invalid",
                success: false,
                received: profileData,
            },
            getHttpCode("bad_request"),
        );
    }

    const expectedAuthAccount = await prisma.authAccount.findFirst({
        where: {
            providerName: profileData.providerName,
            OR: [{ providerAccountEmail: profileData.email }, { providerAccountId: `${profileData.providerAccountId}` }],
        },
        select: {
            id: true,
            user: true,
        },
    });

    const expectedUser = await prisma.user.findUnique({
        where: {
            email: profileData.email,
        },
    });

    if (expectedUser?.id && !expectedAuthAccount?.user?.id) {
        return ctx.json(
            {
                success: false,
                message: `The ${profileData.providerName} provider with email: '${profileData.email}' is not linked with any UserAccount. Please try signing in with a linked auth provider`,
            },
            getHttpCode("bad_request"),
        );
    }

    if (!expectedUser?.id || !expectedAuthAccount?.user?.id) {
        return ctx.json(
            {
                success: false,
                message: `No ${authProvider} AuthAccount exists with email: '${profileData.email}' nor does a User exist with this email address`,
            },
            getHttpCode("bad_request"),
        );
    }

    const newSession = await createNewUserSession({
        userId: expectedAuthAccount.user.id,
        providerName: profileData.providerName,
        ctx: ctx,
        user: expectedUser,
    });
    setUserCookie(ctx, authTokenCookieName, JSON.stringify(newSession));

    return ctx.json(
        { success: true, message: `Successfuly logged in using ${profileData.providerName} as ${expectedAuthAccount.user.fullName}` },
        getHttpCode("ok"),
    );
};
