import type { AuthActionIntent, AuthUserProfile } from "@/../types";
import prisma from "@/services/prisma";
import { generateRandomString, setUserCookie } from "@/utils";
import { CSRF_STATE_COOKIE_NAME } from "@shared/config";
import { AuthProviders } from "@shared/types";
import type { Context } from "hono";
// @ts-ignore
import UAParser from "ua-parser-js";

const authUrlTemplates = {
    [AuthProviders.GITHUB]: (clientId: string, redirectUri: string, csrfState: string) => {
        return `https://github.com/login/oauth/authorize?&response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${redirectUri}&scope=${encodeURIComponent("read:user user:email")}&state=${csrfState}`;
    },
    [AuthProviders.GITLAB]: (clientId: string, redirectUri: string, csrfState: string) => {
        return `https://gitlab.com/oauth/authorize?scope=read_user&response_type=code&client_id=${encodeURI(clientId)}&redirect_uri=${redirectUri}&state=${csrfState}`;
    },
    [AuthProviders.DISCORD]: (clientId: string, redirectUri: string, csrfState: string) => {
        return `https://discord.com/oauth2/authorize?scope=identify+email&response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${csrfState}`;
    },
    [AuthProviders.GOOGLE]: (clientId: string, redirectUri: string, csrfState: string) => {
        return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${redirectUri}&state=${csrfState}&scope=openid+profile+email`;
    },
};

export const getOAuthSignInUrl = (ctx: Context, authProvider: string, actionIntent: AuthActionIntent) => {
    const redirectUri = `${process.env.OAUTH_REDIRECT_URI}/${authProvider}`;
    const csrfState = `${actionIntent}-${generateRandomString(24)}`;

    setUserCookie(ctx, CSRF_STATE_COOKIE_NAME, csrfState, { httpOnly: false });

    switch (authProvider) {
        case AuthProviders.GITHUB:
            return authUrlTemplates[AuthProviders.GITHUB](process.env.GITHUB_ID || "", redirectUri, csrfState);
        case AuthProviders.GITLAB:
            return authUrlTemplates[AuthProviders.GITLAB](process.env.GITLAB_ID || "", redirectUri, csrfState);
        case AuthProviders.DISCORD:
            return authUrlTemplates[AuthProviders.DISCORD](process.env.DISCORD_ID || "", redirectUri, csrfState);
        case AuthProviders.GOOGLE:
            return authUrlTemplates[AuthProviders.GOOGLE](process.env.GOOGLE_ID || "", redirectUri, csrfState);
        default:
            return "";
    }
};

export const createNewAuthAccount = async (
    userId: number,
    { providerName, providerAccountId, email, avatarImage, accessToken, tokenType, refreshToken, authType, scope }: AuthUserProfile,
) => {
    return await prisma.authAccount.create({
        data: {
            userId: userId,
            providerName: providerName,
            providerAccountId: providerAccountId.toString(),
            providerAccountEmail: email,
            avatarImageUrl: avatarImage,
            accessToken: accessToken,
            tokenType: tokenType,
            refreshToken: refreshToken,
            authType: authType,
            authorizationScope: scope,
        },
    });
};

type IpAddressType =
    | {
          address: string;
          family: string;
          port: number;
      }
    | string
    | null;

export type GeoApiData = {
    city?: string;
    country?: string;
};

export const getUserIpAddress = (ctx: Context) => {
    let ipAddr =
        ctx.req.header("x-forwarded-for")?.split(", ")?.[0] || ctx.req.header("x-forwarded-for") || (ctx.env.ip as string as IpAddressType);
    if (typeof ipAddr !== "string") {
        ipAddr = ipAddr?.address || null;
    }

    return ipAddr;
};

export const getUserDeviceDetails = async (ctx: Context) => {
    const userAgent = ctx.req.header("user-agent");
    const ipAddr = getUserIpAddress(ctx);

    const parsedResult = new UAParser(userAgent).getResult();
    const browserName = parsedResult.browser.name;
    const os = {
        name: parsedResult?.os?.name || "",
        version: parsedResult?.os?.version || "",
    };

    const geoData: GeoApiData = {};

    // Gettings Geo data from the IP address
    if (ipAddr) {
        try {
            const res = await fetch(`https://ipinfo.io/${ipAddr}?token=${process.env.IP_TO_GEO_API_KEY}`);
            const resJsonData = await res.json();

            if (resJsonData?.city || resJsonData?.region) {
                geoData.city = `${resJsonData?.city} ${resJsonData?.region}`;
            }
            if (resJsonData?.country) {
                geoData.country = resJsonData?.country;
            }
        } catch (error) {
            console.error(error);
        }
    }

    return {
        browserName,
        os,
        ipAddr,
        ...geoData,
    };
};
