import type { AuthUserProfile } from "@/../types";
import prisma from "@/services/prisma";
import { setUserCookie } from "@/utils";
import httpCode from "@/utils/http";
import { AUTHTOKEN_COOKIE_NAME, SITE_NAME_SHORT } from "@shared/config";
import { AuthProviders } from "@shared/types";
import type { Context } from "hono";
import { getDiscordUserProfileData } from "../discord";
import { getGithubUserProfileData } from "../github";
import { getGitlabUserProfileData } from "../gitlab";
import { getGoogleUserProfileData } from "../google";
import { createNewUserSession } from "../session";
import { Capitalize } from "@shared/lib/utils";

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

    if (
        !profileData ||
        !profileData?.email ||
        !profileData?.providerName ||
        !profileData?.providerAccountId ||
        !profileData.emailVerified
    ) {
        return ctx.json(
            {
                message: "Invalid profile data received from the auth provider, most likely the code provided was invalid",
                success: false,
                received: profileData,
            },
            httpCode("bad_request"),
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
                message: `This ${Capitalize(profileData.providerName)} account (${profileData.email}) is not linked to any ${SITE_NAME_SHORT} user account. First link ${Capitalize(profileData.providerName)} auth provider to your user account to be able to signin using ${Capitalize(profileData.providerName)}`,
            },
            httpCode("bad_request"),
        );
    }

    if (!expectedUser?.id || !expectedAuthAccount?.user?.id) {
        return ctx.json(
            {
                success: false,
                message: `This ${Capitalize(authProvider)} account is not linked to any user account nor does a user exist with the email address '${profileData.email}'. If you meant to create a new account, signup instead`,
            },
            httpCode("bad_request"),
        );
    }

    const newSession = await createNewUserSession({
        userId: expectedAuthAccount.user.id,
        providerName: profileData.providerName,
        ctx: ctx,
        user: expectedUser,
    });
    setUserCookie(ctx, AUTHTOKEN_COOKIE_NAME, JSON.stringify(newSession));

    return ctx.json(
        { success: true, message: `Successfuly logged in using ${profileData.providerName} as ${expectedAuthAccount.user.fullName}` },
        httpCode("ok"),
    );
};
