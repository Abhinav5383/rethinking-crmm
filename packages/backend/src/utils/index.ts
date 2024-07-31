import type { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import type { CookieOptions } from "hono/utils/cookie";
import { ctxReqAuthSessionKey } from "../../types";
import type { LoggedInUserData } from "@shared/types";

const shuffleCharacters = (str: string) => {
    const characters = str.split("");
    for (let i = characters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [characters[i], characters[j]] = [characters[j], characters[i]];
    }
    return characters.join("");
};

export const generateRandomString = (length = 32) => {
    let result = shuffleCharacters(crypto.randomUUID().replaceAll("-", ""));
    while (result.length < length) {
        result += shuffleCharacters(crypto.randomUUID().replaceAll("-", ""));
    }

    return shuffleCharacters(result.slice(0, length));
};

// Cookie things
export const setUserCookie = (ctx: Context, name: string, value: string, options?: CookieOptions) => {
    return setCookie(ctx, name, value, {
        domain: "localhost",
        httpOnly: true,
        secure: true,
        ...options,
    });
};

export const deleteUserCookie = (ctx: Context, name: string, options?: CookieOptions) => {
    return deleteCookie(ctx, name, options);
};

export const getCurrSessionFromCtx = (ctx: Context) => {
    return ctx.get(ctxReqAuthSessionKey) as LoggedInUserData | undefined;
};
