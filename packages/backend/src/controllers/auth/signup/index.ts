import type { AuthUserProfile } from "@/../types";
import prisma from "@/services/prisma";
import { generateRandomString, setUserCookie } from "@/utils";
import getHttpCode from "@/utils/http";
import { authTokenCookieName } from "@shared/config";
import { AuthProviders } from "@shared/types";
import type { Context } from "hono";
import { createNewAuthAccount } from "../commons";
import { getDiscordUserProfileData } from "../discord";
import { getGithubUserProfileData } from "../github";
import { getGitlabUserProfileData } from "../gitlab";
import { getGoogleUserProfileData } from "../google";
import { createNewUserSession } from "../session";

export const oAuthSignUpHandler = async (ctx: Context, authProvider: string, tokenExchangeCode: string) => {
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
                data: profileData,
            },
            getHttpCode("bad_request"),
        );
    }

    // Return if an auth account already exists with the same provider
    const possiblyAlreadyExistingAuthAccount = await prisma.authAccount.findFirst({
        where: {
            providerName: profileData.providerName,
            OR: [{ providerAccountId: `${profileData.providerAccountId}` }, { providerAccountEmail: profileData.email }],
        },
    });
    if (possiblyAlreadyExistingAuthAccount?.id) {
        return ctx.json(
            { success: false, message: "A user already exists with the account you are trying to sign up with." },
            getHttpCode("bad_request"),
        );
    }

    // Return if a user already exists with the same email
    const possiblyAlreadyExistingUser = await prisma.user.findUnique({
        where: {
            email: profileData.email,
        },
    });
    if (possiblyAlreadyExistingUser?.id) {
        return ctx.json(
            { success: false, message: "A user already exists with the account you are trying to sign up with." },
            getHttpCode("bad_request"),
        );
    }

    // Finally create a user
    const newUser = await prisma.user.create({
        data: {
            fullName: profileData?.name || "",
            userName: generateRandomString(16),
            email: profileData.email,
            dateEmailVerified: new Date(),
            avatarImageUrl: profileData.avatarImage,
            avatarImageProvier: profileData.providerName,
            settings: {
                create: {
                    signInAlerts: true,
                },
            },
        },
    });

    await createNewAuthAccount(newUser.id, profileData);

    const newSession = await createNewUserSession({
        userId: newUser.id,
        providerName: authProvider,
        ctx,
        isFirstSignIn: true,
        user: newUser,
    });
    setUserCookie(ctx, authTokenCookieName, JSON.stringify(newSession));

    return ctx.json(
        {
            success: true,
            message: `Successfully signed up using ${authProvider} as ${newUser.fullName}`,
        },
        getHttpCode("ok"),
    );
};
