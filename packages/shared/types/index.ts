export enum AuthProviders {
    GITHUB = "github",
    GITLAB = "gitlab",
    DISCORD = "discord",
    GOOGLE = "google",
    CREDENTIAL = "credential",
    UNKNOWN = "unknown",
}

export enum GlobalUserRoles {
    ADMIN = "admin",
    MODERATOR = "moderator",
    CREATOR = "creator",
    USER = "user",
}

export enum UserSessionStates {
    ACTIVE = "active",
    UNVERIFIED = "unverified",
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

export enum ProjectType {
    MOD = "mod",
    MODPACK = "modpack",
    SHADER = "shader",
    RESOURCE_PACK = "resource-pack",
    DATAPACK = "datapack",
    PLUGIN = "plugin",
}

export enum AuthActionIntent {
    SIGN_IN = "signin",
    SIGN_UP = "signup",
    LINK_PROVIDER = "link-provider",
}

export interface LinkedProvidersListData {
    id: number;
    providerName: string;
    providerAccountId: number | string;
    providerAccountEmail: string;
    avatarImageUrl?: string | null;
}
