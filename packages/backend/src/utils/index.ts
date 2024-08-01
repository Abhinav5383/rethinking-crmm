import type { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import type { CookieOptions } from "hono/utils/cookie";
import { ctxReqAuthSessionKey } from "../../types";
import type { ConfirmationActionTypes, LoggedInUserData } from "@shared/types";
import { PASSWORD_HASH_SALT_ROUNDS } from "@shared/config";

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

// Hash the user password
export const hashPassword = async (password: string) => {
    const hashedPassword = await Bun.password.hash(password, {
        algorithm: "argon2id",
        timeCost: PASSWORD_HASH_SALT_ROUNDS,
    });

    return hashedPassword;
};

// Compare plain text password and the hashed password
export const matchPassword = async (password: string, hash: string) => {
    try {
        return await Bun.password.verify(password, hash, "argon2id");
    } catch (error) {
        return false;
    }
};

export const generateConfirmationEmailCode = (actionType: ConfirmationActionTypes, userId: number, length = 24) => {
    return `${actionType}-${userId}-${generateRandomString(length)}`;
};

export const generateRevokeSessionAccessCode = (userId: number, length = 24) => {
    return `revoke-session-${userId}-${generateRandomString(length)}`;
};
