import prisma from "@/services/prisma";
import { generateRandomString } from "@/utils";
import { sendNewSigninAlertEmail } from "@/utils/email";
import type { User } from "@prisma/client";
import { authTokenCookieName, userSessionValidity } from "@root/config";
import { UserSessionStates } from "@root/types";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import { getUserDeviceDetails } from "./commons";

interface CreateNewSessionProps {
    userId: number;
    providerName: string;
    ctx: Context
    isFirstSignIn?: boolean;
    user: Partial<User>
}

interface UserSessionCookieData {
    userId: number,
    sessionId: number,
    sessionToken: string;
}

export const createNewUserSession = async ({ userId, providerName, ctx, isFirstSignIn, user }: CreateNewSessionProps): Promise<UserSessionCookieData> => {
    const deviceDetails = await getUserDeviceDetails(ctx);

    if (isFirstSignIn !== true) {
        const userSettings = await prisma.userSettings.findUnique({
            where: {
                userId: userId
            }
        });

        if (userSettings?.signInAlerts === true) {
            const allPreviousSessions = await prisma.userSession.findMany({
                where: {
                    userId: userId
                }
            });

            const currIp = deviceDetails.ipAddr;
            let isSignInFromUnknownLocation = true;

            for (const prevSession of allPreviousSessions) {
                if (prevSession.ipAddress === currIp) {
                    isSignInFromUnknownLocation = false;
                    break;
                }
            }

            if (isSignInFromUnknownLocation === true) {
                sendNewSigninAlertEmail({
                    fullName: user.fullName || "",
                    receiverEmail: user.email || "",
                    region: deviceDetails.city || "",
                    country: deviceDetails.country || "",
                    ip: deviceDetails.ipAddr || "",
                    browserName: deviceDetails.browserName || "",
                    osName: deviceDetails.os.name || "",
                    authProviderName: providerName || "",
                })
            }
        }
    }

    const newSession = await prisma.userSession.create({
        data: {
            userId: userId,
            sessionToken: generateRandomString(30),
            providerName: providerName,
            dateExpires: new Date(Date.now() + userSessionValidity),
            status: UserSessionStates.ACTIVE,
            os: `${deviceDetails.os.name} ${deviceDetails.os.version || ""}`,
            browserName: deviceDetails.browserName || "",
            ipAddress: deviceDetails.ipAddr || "",
            city: deviceDetails.city || "",
            country: deviceDetails.country || ""
        }
    });

    // TODO: Send an alert on email if anything suspicious about the signin

    return {
        userId: userId,
        sessionId: newSession.id,
        sessionToken: newSession.sessionToken
    }
}

export const getUserSessionCookie = (c: Context): UserSessionCookieData | null => {
    try {
        const cookie = getCookie(c, authTokenCookieName);
        if (!cookie) {
            return null;
        }
        const cookieData = JSON.parse(cookie) as UserSessionCookieData;
        return cookieData;
    } catch (error) { }
    return null;
};

export async function getLoggedInUser(sessionId: number, sessionToken: string): Promise<User | null> {
    try {
        if (!sessionId || !sessionToken) {
            throw new Error("Missing required fields!");
        }

        const session = await prisma.userSession.update({
            where: {
                id: sessionId,
                sessionToken: sessionToken,
            },
            data: {
                dateLastActive: new Date(),
            },
            select: {
                user: true,
            },
        });

        return session?.user || null;
    } catch (error) {
        return null;
    }
}

export const getUserSession = async (
    ctx: Context,
): Promise<User | null> => {
    try {
        // Get the current cookie data
        const cookie = getUserSessionCookie(ctx);
        if (!cookie || !cookie?.sessionId || !cookie?.sessionToken) {
            return null;
        }

        // Get the current logged in user from the cookie data
        const user = await getLoggedInUser(cookie?.sessionId, cookie?.sessionToken);
        if (!user?.id) {
            return null;
        }

        return user;
    } catch (error) {
        console.error(error);
        return null;
    }
};