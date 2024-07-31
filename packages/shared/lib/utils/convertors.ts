import { AuthProviders, GlobalUserRoles } from "../../types";

export const GetUserRoleFromString = (roleName: string) => {
    switch (roleName) {
        case GlobalUserRoles.ADMIN:
            return GlobalUserRoles.ADMIN;
        case GlobalUserRoles.MODERATOR:
            return GlobalUserRoles.MODERATOR;
        case GlobalUserRoles.CREATOR:
            return GlobalUserRoles.CREATOR;
        case GlobalUserRoles.USER:
            return GlobalUserRoles.USER;
        default:
            return GlobalUserRoles.USER;
    }
};

export const GetAuthProviderFromString = (providerName: string) => {
    switch (providerName) {
        case AuthProviders.GITHUB:
            return AuthProviders.GITHUB;
        case AuthProviders.GITLAB:
            return AuthProviders.GITLAB;
        case AuthProviders.DISCORD:
            return AuthProviders.DISCORD;
        case AuthProviders.GOOGLE:
            return AuthProviders.GOOGLE;
        case AuthProviders.CREDENTIAL:
            return AuthProviders.CREDENTIAL;
        default:
            return AuthProviders.UNKNOWN;
    }
};
