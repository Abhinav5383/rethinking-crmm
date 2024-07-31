import { AuthProviders, ProjectType } from "../types";

export const AuthProvidersList = [
    AuthProviders.GITHUB,
    AuthProviders.GITLAB,
    AuthProviders.DISCORD,
    AuthProviders.GOOGLE,
    AuthProviders.CREDENTIAL,
];

export const ProjectTypes = [
    ProjectType.MOD,
    ProjectType.PLUGIN,
    ProjectType.MODPACK,
    ProjectType.DATAPACK,
    ProjectType.RESOURCE_PACK,
    ProjectType.SHADER,
];
