import { z } from "zod";
import { AuthProviders } from "../types";
import {
    MAX_NAME_LENGTH,
    MAX_PASSWORD_LENGTH,
    MAX_USERNAME_LENGTH,
    MIN_NAME_LENGTH,
    MIN_PASSWORD_LENGTH,
    MIN_USERNAME_LENGTH,
} from "../config/forms";

export const profileUpdateFormSchema = z.object({
    avatarImageProvider: z.nativeEnum(AuthProviders),
    userName: z
        .string()
        .min(MIN_USERNAME_LENGTH, "Enter your username")
        .max(MAX_USERNAME_LENGTH, `Your username can only have a maximum of ${MAX_USERNAME_LENGTH} characters`),
    fullName: z
        .string()
        .min(MIN_NAME_LENGTH, "Enter your full name")
        .max(MAX_NAME_LENGTH, `Your name can only have a maximum of ${MAX_NAME_LENGTH} characters`),
});

export const addPasswordFormSchema = z.object({
    newPassword: z
        .string()
        .min(MIN_PASSWORD_LENGTH, `Your password must be atleast ${MIN_PASSWORD_LENGTH} characters`)
        .max(MAX_PASSWORD_LENGTH, `Your password can only have a maximum of ${MAX_PASSWORD_LENGTH} characters`),

    confirmNewPassword: z
        .string()
        .min(MIN_PASSWORD_LENGTH, `Your password must be atleast ${MIN_PASSWORD_LENGTH} characters`)
        .max(MAX_PASSWORD_LENGTH, `Your password can only have a maximum of ${MAX_PASSWORD_LENGTH} characters`),
});
