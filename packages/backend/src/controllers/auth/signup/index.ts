import prisma from "@/services/prisma";
import { generateRandomString, setUserCookie } from "@/utils";
import httpCode from "@/utils/http";
import { AUTHTOKEN_COOKIE_NAME } from "@shared/config";
import type { Context } from "hono";
import { createNewAuthAccount, getAuthProviderProfileData } from "../commons";
import { createNewUserSession } from "../session";

export const oAuthSignUpHandler = async (ctx: Context, authProvider: string, tokenExchangeCode: string) => {
    const profileData = await getAuthProviderProfileData(authProvider, tokenExchangeCode);

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
                data: profileData,
            },
            httpCode("bad_request"),
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
            { success: false, message: "A user already exists with this account, try to login instead" },
            httpCode("bad_request"),
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
            { success: false, message: "A user already exists with the email you are trying to sign up with." },
            httpCode("bad_request"),
        );
    }

    const userName = generateRandomString(24);
    // Finally create a user
    const newUser = await prisma.user.create({
        data: {
            fullName: profileData?.name || "",
            userName: userName,
            userNameLowerCase: userName.toLowerCase(),
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
    setUserCookie(ctx, AUTHTOKEN_COOKIE_NAME, JSON.stringify(newSession));

    return ctx.json(
        {
            success: true,
            message: `Successfully signed up using ${authProvider} as ${newUser.fullName}`,
        },
        httpCode("ok"),
    );
};
