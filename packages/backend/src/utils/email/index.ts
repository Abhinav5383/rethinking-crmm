import { sendEmail } from "@/services/email";
import { monthNames } from "@root/lib/utils/date-time";
import { newSignInAlertEmailTemplate } from "./templates";

const frontendUrl = process.env.FRONTEND_URL;

export const sendNewSigninAlertEmail = async ({
    fullName,
    receiverEmail,
    region,
    country,
    ip,
    browserName,
    osName,
    authProviderName
}: {
    fullName: string;
    receiverEmail: string;
    region: string;
    country: string;
    ip: string;
    browserName: string;
    osName: string;
    authProviderName: string;
}) => {
    try {
        const currTime = new Date();

        const emailTemplate = newSignInAlertEmailTemplate({
            fullName: fullName,
            sessionsPageUrl: `${frontendUrl}/settings/sessions`,
            siteUrl: frontendUrl || "",
            osName: osName,
            browserName: browserName,
            ipAddress: ip,
            authProviderName: authProviderName,
            signInLocation: `${region} - ${country}`,
            formattedUtcTimeStamp: `${monthNames[currTime.getUTCMonth()]} ${currTime.getUTCDate()}, ${currTime.getUTCFullYear()} at ${currTime.getUTCHours()}:${currTime.getUTCMinutes()}  (UTC Time)`,
        });

        await sendEmail({
            receiver: receiverEmail,
            subject: emailTemplate.subject,
            text: emailTemplate.text,
            template: emailTemplate.emailHtml,
        });

        return { success: true, message: "Email sent successfully" };
    } catch (err) {
        console.error(err);
        return {
            success: false,
            message: "Error while sending email",
        };
    }
};