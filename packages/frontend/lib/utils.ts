import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getCookie = (key: string) => {
    for (const cookie of document.cookie.split("; ")) {
        if (cookie.split("=")[0] === key) {
            return cookie.split("=")[1];
        }
    }
    return null;
};

export const isCurrLinkActive = (url: string, pathname?: string, exactEnds = true) => {
    if (exactEnds === true) {
        return (pathname || window.location.pathname).endsWith(url);
    }
    return (pathname || window.location.pathname).includes(url);
};
