import type { User } from "@prisma/client";

export const ctxReqBodyKey = "reqBody";
export const ctxReqAuthSessionKey = "user-session";

export interface AuthUserProfile {
    name?: string | null;
    email: string;
    emailVerified: boolean;
    providerName: string;
    providerAccountId: string | number;
    authType?: string | null;
    accessToken: string;
    refreshToken?: string | null;
    tokenType?: string | null;
    scope?: string | null;
    avatarImage?: string | null;
}

export interface UserDeviceDetails {
    ipAddress: string;
    browser: string;
    os: {
        name: string;
        version?: string;
    };
    city: string;
    country: string;
}

export interface ContextUserSession extends User {
    sessionId: number;
    sessionToken: string;
}
