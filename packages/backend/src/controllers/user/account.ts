import prisma from "@/services/prisma";
import { generateRandomString, getCurrSessionFromCtx, hashPassword, matchPassword } from "@/utils";
import { sendConfirmNewPasswordEmail } from "@/utils/email";
import getHttpCode from "@/utils/http";
import {
    CHANGE_ACCOUNT_PASSWORD_EMAIL_VALIDITY_ms,
    CONFIRM_NEW_PASSWORD_EMAIL_VALIDITY_ms,
    DELETE_USER_ACCOUNT_EMAIL_VALIDITY_ms,
} from "@shared/config";
import { getConfirmActionTypeFromStringName } from "@shared/lib/utils/convertors";
import type { addPasswordFormSchema, removeAccountPasswordFormSchema } from "@shared/schemas/settings";
import { ConfirmationActionTypes } from "@shared/types";
import type { Context } from "hono";
import type { z } from "zod";

const confirmationEmailValidityDict = {
    [ConfirmationActionTypes.CONFIRM_NEW_PASSWORD]: CONFIRM_NEW_PASSWORD_EMAIL_VALIDITY_ms,
    [ConfirmationActionTypes.CHANGE_ACCOUNT_PASSWORD]: CHANGE_ACCOUNT_PASSWORD_EMAIL_VALIDITY_ms,
    [ConfirmationActionTypes.DELETE_USER_ACCOUNT]: DELETE_USER_ACCOUNT_EMAIL_VALIDITY_ms,
};

export const addNewPassword = async (ctx: Context, formData: z.infer<typeof addPasswordFormSchema>) => {
    if (formData.newPassword !== formData.confirmNewPassword)
        return ctx.json({ success: false, message: "Passwords do not match" }, getHttpCode("bad_request"));

    const userSession = getCurrSessionFromCtx(ctx);
    if (!userSession || userSession.hasAPassword === true) return ctx.json({}, getHttpCode("bad_request"));

    const hashedPassword = await hashPassword(formData.newPassword);
    const code = `${ConfirmationActionTypes.CONFIRM_NEW_PASSWORD}-${userSession.id}-${generateRandomString(24)}`;

    const confirmationEmail = await prisma.confirmationEmail.create({
        data: {
            userId: userSession.id,
            actionType: ConfirmationActionTypes.CONFIRM_NEW_PASSWORD,
            code: code,
            data: hashedPassword,
        },
    });

    sendConfirmNewPasswordEmail({
        fullName: userSession.fullName,
        code: confirmationEmail.code,
        receiverEmail: userSession.email,
    });

    return ctx.json({ message: "You should receive a confirmation email shortly.", success: true }, getHttpCode("ok"));
};

export const getConfirmActionTypeFromCode = async (ctx: Context, code: string) => {
    const confirmationEmail = await prisma.confirmationEmail.findUnique({
        where: {
            code: code,
        },
    });

    const actionType = getConfirmActionTypeFromStringName(confirmationEmail?.actionType || "");
    if (!confirmationEmail || !actionType)
        return ctx.json({ success: false, message: "Invalid or expired code" }, getHttpCode("bad_request"));

    const isCodeValid = Date.now() <= new Date(confirmationEmail.dateCreated).getTime() + confirmationEmailValidityDict[actionType];
    if (!isCodeValid) return ctx.json({ success: false, message: "Invalid or expired code" }, getHttpCode("bad_request"));

    return ctx.json({ actionType: actionType, success: true }, getHttpCode("ok"));
};

export const cancelAddingNewPassword = async (ctx: Context, code: string) => {
    const confirmationEmail = await prisma.confirmationEmail.delete({
        where: { code: code },
    });

    const actionType = getConfirmActionTypeFromStringName(confirmationEmail?.actionType || "");
    if (!confirmationEmail || !actionType)
        return ctx.json({ success: false, message: "Invalid or expired code" }, getHttpCode("bad_request"));

    return ctx.json({ success: true, message: "Cancelled successfully" }, getHttpCode("ok"));
};

export const confirmAddingNewPassword = async (ctx: Context, code: string) => {
    const confirmationEmail = await prisma.confirmationEmail.delete({
        where: { code: code },
    });

    const actionType = getConfirmActionTypeFromStringName(confirmationEmail?.actionType || "");
    if (!confirmationEmail || !actionType)
        return ctx.json({ success: false, message: "Invalid or expired code" }, getHttpCode("bad_request"));

    const isCodeValid = Date.now() <= new Date(confirmationEmail.dateCreated).getTime() + confirmationEmailValidityDict[actionType];
    if (!isCodeValid) return ctx.json({ success: false, message: "Invalid or expired code" }, getHttpCode("bad_request"));

    await prisma.user.update({
        where: {
            id: confirmationEmail.userId,
        },
        data: {
            password: confirmationEmail.data,
        },
    });

    await prisma.confirmationEmail.deleteMany({
        where: {
            userId: confirmationEmail.userId,
            actionType: actionType,
        },
    });

    return ctx.json({ success: true, message: "Successfully added the new password" }, getHttpCode("ok"));
};

export const removeAccountPassword = async (ctx: Context, formData: z.infer<typeof removeAccountPasswordFormSchema>) => {
    const userSession = getCurrSessionFromCtx(ctx);
    if (!userSession || userSession.hasAPassword === true) return ctx.json({}, getHttpCode("bad_request"));

    const userData = await prisma.user.findUnique({
        where: {
            id: userSession.id,
        },
    });
    if (!userData?.password) return ctx.json({ success: false }, getHttpCode("bad_request"));

    const isCorrectPassword = await matchPassword(formData.password, userData.password);
    if (!isCorrectPassword) return ctx.json({ success: false, message: "Incorrect password" }, getHttpCode("bad_request"));

    await prisma.user.update({
        where: {
            id: userSession.id,
        },
        data: {
            password: null,
        },
    });

    return ctx.json({ success: true, message: "Account password removed successfully" }, getHttpCode("ok"));
};
