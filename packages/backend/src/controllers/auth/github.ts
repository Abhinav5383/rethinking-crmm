import type { AuthUserProfile } from "@/../types";
import { AuthProviders } from "@shared/types";

async function fetchUserData(access_token: string) {
    const userDataRes = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `token ${access_token}`,
        },
    });

    return await userDataRes.json();
}

type EmailData = {
    email: string;
    primary: boolean;
    verified: boolean;
    visibility: string | null;
};

async function fetchUserEmail(access_token: string): Promise<EmailData | null> {
    const userEmailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${access_token}`,
            "X-Github-Api-Version": "2022-11-28",
        },
    });

    const userEmailData = (await userEmailRes.json()) as EmailData[];
    let userEmailObj: EmailData | null = null;

    for (const emailObj of userEmailData) {
        if (emailObj?.primary === true) {
            userEmailObj = emailObj;
        }
    }

    if (userEmailObj?.verified !== true) {
        throw new Error("Your email is not verified. First verify your email on Github");
    }

    return userEmailObj;
}
export const getGithubUserProfileData = async (tokenExchangeCode: string) => {
    const authTokenRes = await fetch(
        `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_ID}&client_secret=${process.env.GITHUB_SECRET}&code=${tokenExchangeCode}`,
        {
            method: "POST",
            headers: {
                accept: "application/json",
            },
        },
    );

    const tokenData = await authTokenRes.json();
    const accessToken = tokenData?.access_token;
    if (!accessToken) return null;

    const [userData, userEmailData] = await Promise.all([fetchUserData(accessToken), fetchUserEmail(accessToken)]);

    const profile: AuthUserProfile = {
        name: userData?.name || null,
        email: userEmailData?.email || "",
        providerName: AuthProviders.GITHUB,
        providerAccountId: userData?.id || null,
        authType: "oauth",
        accessToken: accessToken,
        refreshToken: null,
        tokenType: tokenData?.token_type || null,
        scope: tokenData?.scope || null,
        avatarImage: userData?.avatar_url || null,
    };

    return profile;
};
