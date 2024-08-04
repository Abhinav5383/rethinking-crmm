import type { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: string;
};

export enum ThemeOptions {
    LIGHT = "light",
    DARK = "dark",
}

export interface UseThemeProps {
    themes?: string[];
    setTheme: (value: string | ((theme: string | undefined) => string)) => void;
    theme?: string | undefined;
}

export interface UserSession {
    id: number;
    userId: number;
    sessionToken: string;
    dateCreated: string;
    dateExpires: string;
    dateLastActive: string;
    providerName: string;
    status: string;
    browserName: string;
    os: string;
    ipAddress: string;
    city: string;
    country: string;
}