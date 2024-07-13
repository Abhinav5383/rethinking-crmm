export enum AuthProviders {
    GITHUB = "github",
    GITLAB = "gitlab",
    DISCORD = "discord",
    GOOGLE = "google",
    CREDENTIAL = "credential",
    UNKNOWN = "unknown"
}

export enum GlobalUserRoles {
    ADMIN = "admin",
    MODERATOR = "moderator",
    CREATOR = "creator",
    USER = "user",
}

export enum UserSessionStates {
    ACTIVE = "active",
    UNVERIFIED = "unverified"
}

export interface LoggedInUserData {
    id: number;
    email: string;
    fullName: string;
    userName: string;
    hasAPassword: boolean;
    avatarImageUrl?: string | null;
    avatarProvider?: AuthProviders | null;
    role: GlobalUserRoles;
    sessionId: number;
    sessionToken: string;
}