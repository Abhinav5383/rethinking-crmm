import { AuthProviders, ConfirmationActionTypes, GlobalUserRoles } from "../../types";

export const getUserRoleFromString = (roleName: string) => {
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

export const getAuthProviderFromString = (providerName: string) => {
    switch (providerName.toLowerCase()) {
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

export const getConfirmActionTypeFromStringName = (type: string) => {
    switch (type) {
        case ConfirmationActionTypes.CONFIRM_NEW_PASSWORD:
            return ConfirmationActionTypes.CONFIRM_NEW_PASSWORD;
        case ConfirmationActionTypes.CHANGE_ACCOUNT_PASSWORD:
            return ConfirmationActionTypes.CHANGE_ACCOUNT_PASSWORD;
        case ConfirmationActionTypes.DELETE_USER_ACCOUNT:
            return ConfirmationActionTypes.DELETE_USER_ACCOUNT;
        default:
            return null;
    }
};
