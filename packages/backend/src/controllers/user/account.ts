import { addToUsedRateLimit } from "@/middleware/rate-limiter";
import prisma from "@/services/prisma";
import { generateConfirmationEmailCode, getCurrSessionFromCtx, hashPassword, matchPassword } from "@/utils";
import { sendChangePasswordEmail, sendConfirmNewPasswordEmail } from "@/utils/email";
import httpCode, { defaultInvalidReqResponse } from "@/utils/http";
import type { ConfirmationEmail } from "@prisma/client";
import {
    CHANGE_ACCOUNT_PASSWORD_EMAIL_VALIDITY_ms,
    CONFIRM_NEW_PASSWORD_EMAIL_VALIDITY_ms,
    DELETE_USER_ACCOUNT_EMAIL_VALIDITY_ms,
} from "@shared/config";
import { CHARGE_FOR_SENDING_INVALID_DATA, USER_WRONG_CREDENTIAL_ATTEMPT_CHARGE } from "@shared/config/rate-limit-charges";
import { getConfirmActionTypeFromStringName } from "@shared/lib/utils/convertors";
import type {
    removeAccountPasswordFormSchema,
    sendAccoutPasswordChangeLinkFormSchema,
    setNewPasswordFormSchema,
} from "@shared/schemas/settings";
import { ConfirmationActionTypes } from "@shared/types";
import type { Context } from "hono";
import type { z } from "zod";

const confirmationEmailValidityDict = {
    [ConfirmationActionTypes.CONFIRM_NEW_PASSWORD]: CONFIRM_NEW_PASSWORD_EMAIL_VALIDITY_ms,
    [ConfirmationActionTypes.CHANGE_ACCOUNT_PASSWORD]: CHANGE_ACCOUNT_PASSWORD_EMAIL_VALIDITY_ms,
    [ConfirmationActionTypes.DELETE_USER_ACCOUNT]: DELETE_USER_ACCOUNT_EMAIL_VALIDITY_ms,
};

export const addNewPassword = async (ctx: Context, formData: z.infer<typeof setNewPasswordFormSchema>) => {
    if (formData.newPassword !== formData.confirmNewPassword)
        return ctx.json({ success: false, message: "Passwords do not match" }, httpCode("bad_request"));

    const userSession = getCurrSessionFromCtx(ctx);
    if (!userSession || userSession.hasAPassword === true) return ctx.json({}, httpCode("bad_request"));

    const hashedPassword = await hashPassword(formData.newPassword);
    const code = generateConfirmationEmailCode(ConfirmationActionTypes.CONFIRM_NEW_PASSWORD, userSession.id);

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

    return ctx.json({ message: "You should receive a confirmation email shortly.", success: true }, httpCode("ok"));
};

export const getConfirmActionTypeFromCode = async (ctx: Context, code: string) => {
    const confirmationEmail = await prisma.confirmationEmail.findUnique({
        where: {
            code: code,
        },
    });

    const actionType = getConfirmActionTypeFromStringName(confirmationEmail?.actionType || "");
    if (!confirmationEmail || !actionType) return ctx.json({ success: false, message: "Invalid or expired code" }, httpCode("bad_request"));

    const isCodeValid = Date.now() <= new Date(confirmationEmail.dateCreated).getTime() + confirmationEmailValidityDict[actionType];
    if (!isCodeValid) return ctx.json({ success: false, message: "Invalid or expired code" }, httpCode("bad_request"));

    return ctx.json({ actionType: actionType, success: true }, httpCode("ok"));
};

export const cancelAddingNewPassword = async (ctx: Context, code: string) => {
    const confirmationEmail = await prisma.confirmationEmail.delete({
        where: { code: code },
    });

    const actionType = getConfirmActionTypeFromStringName(confirmationEmail?.actionType || "");
    if (!confirmationEmail || !actionType) return ctx.json({ success: false, message: "Invalid or expired code" }, httpCode("bad_request"));

    return ctx.json({ success: true, message: "Cancelled successfully" }, httpCode("ok"));
};

export const confirmAddingNewPassword = async (ctx: Context, code: string) => {
    const confirmationEmail = await prisma.confirmationEmail.delete({
        where: { code: code },
    });

    const actionType = getConfirmActionTypeFromStringName(confirmationEmail?.actionType || "");
    if (!confirmationEmail || !actionType) return ctx.json({ success: false, message: "Invalid or expired code" }, httpCode("bad_request"));

    const isCodeValid = Date.now() <= new Date(confirmationEmail.dateCreated).getTime() + confirmationEmailValidityDict[actionType];
    if (!isCodeValid) return ctx.json({ success: false, message: "Invalid or expired code" }, httpCode("bad_request"));

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

    return ctx.json({ success: true, message: "Successfully added the new password" }, httpCode("ok"));
};

export const removeAccountPassword = async (ctx: Context, formData: z.infer<typeof removeAccountPasswordFormSchema>) => {
    const userSession = getCurrSessionFromCtx(ctx);
    if (!userSession || userSession.hasAPassword === true) return ctx.json({}, httpCode("bad_request"));

    const userData = await prisma.user.findUnique({
        where: {
            id: userSession.id,
        },
    });
    if (!userData?.password) return ctx.json({ success: false }, httpCode("bad_request"));

    const isCorrectPassword = await matchPassword(formData.password, userData.password);
    if (!isCorrectPassword) {
        await addToUsedRateLimit(ctx, USER_WRONG_CREDENTIAL_ATTEMPT_CHARGE);
        return ctx.json({ success: false, message: "Incorrect password" }, httpCode("bad_request"));
    }

    await prisma.user.update({
        where: {
            id: userSession.id,
        },
        data: {
            password: null,
        },
    });

    return ctx.json({ success: true, message: "Account password removed successfully" }, httpCode("ok"));
};

export const sendAccountPasswordChangeLink = async (ctx: Context, formData: z.infer<typeof sendAccoutPasswordChangeLinkFormSchema>) => {
    const targetUser = await prisma.user.findUnique({
        where: {
            email: formData.email,
        },
    });

    if (!targetUser?.id) {
        await addToUsedRateLimit(ctx, CHARGE_FOR_SENDING_INVALID_DATA);
        return ctx.json(
            {
                success: true,
                message: "You should receive an email with a link to change your password if you entered correct email address.",
            },
            httpCode("ok"),
        );
    }

    const changePasswordConfirmationEmail = await prisma.confirmationEmail.create({
        data: {
            userId: targetUser.id,
            actionType: ConfirmationActionTypes.CHANGE_ACCOUNT_PASSWORD,
            code: generateConfirmationEmailCode(ConfirmationActionTypes.CHANGE_ACCOUNT_PASSWORD, targetUser.id),
        },
    });

    sendChangePasswordEmail({
        fullName: targetUser.fullName,
        code: changePasswordConfirmationEmail.code,
        receiverEmail: targetUser.email,
    });

    return ctx.json(
        {
            success: true,
            message: "You should receive an email with a link to change your password if you entered correct email address.",
        },
        httpCode("ok"),
    );
};

export const cancelSettingNewPassword = async (ctx: Context, code: string) => {
    let confirmationEmail: ConfirmationEmail | null = null;
    try {
        confirmationEmail = await prisma.confirmationEmail.delete({
            where: {
                code: code,
            },
        });

        if (confirmationEmail?.userId) {
            await prisma.confirmationEmail.deleteMany({
                where: {
                    userId: confirmationEmail.userId,
                    actionType: confirmationEmail.actionType,
                },
            });
        }
    } catch (err) {}

    return ctx.json({ success: true, message: "Cancelled" }, httpCode("ok"));
};

export const setNewPassword = async (ctx: Context, code: string, formData: z.infer<typeof setNewPasswordFormSchema>) => {
    if (formData.newPassword !== formData.confirmNewPassword) return defaultInvalidReqResponse(ctx, "Passwords do not match");

    let confirmationEmail: ConfirmationEmail | null = null;
    try {
        confirmationEmail = await prisma.confirmationEmail.delete({
            where: {
                code: code,
            },
        });

        if (confirmationEmail?.userId) {
            await prisma.confirmationEmail.deleteMany({
                where: {
                    userId: confirmationEmail.userId,
                    actionType: confirmationEmail.actionType,
                },
            });
        }
    } catch (err) {}

    if (!code || !confirmationEmail?.userId) return defaultInvalidReqResponse(ctx);
    const hashedPassword = await hashPassword(formData.newPassword);

    await prisma.user.update({
        where: {
            id: confirmationEmail.userId,
        },
        data: {
            password: hashedPassword,
        },
    });

    return ctx.json({ success: true, message: "Successfully changed account password" }, httpCode("ok"));
};
