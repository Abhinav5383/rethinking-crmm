export const ctxReqBodyKey = "reqBody";

export interface AuthUserProfile {
    name?: string | null;
    email: string;
    providerName: string;
    providerAccountId: string | number;
    authType?: string | null;
    accessToken: string;
    refreshToken?: string | null;
    tokenType?: string | null;
    scope?: string | null;
    avatarImage?: string | null;
}

export enum AuthActionIntent {
    SIGN_IN = "signin",
    SIGN_UP = "signup",
    LINK_PROVIDER = "link-provider"
}

export interface UserDeviceDetails {
    ipAddress: string;
    browser: string;
    os: {
        name: string;
        version?: string;
    },
    city: string;
    country: string;
}