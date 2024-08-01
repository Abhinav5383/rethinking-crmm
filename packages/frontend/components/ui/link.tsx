import { Link, useLocation } from "react-router-dom";
import { cn, isCurrLinkActive } from "@/lib/utils";

type ButtonLinkProps = {
    url: string;
    children: React.ReactNode;
    className?: string;
    exactTailMatch?: boolean;
    activityIndicator?: boolean;
};

export const ButtonLink = ({ url, children, className, exactTailMatch, activityIndicator = true }: ButtonLinkProps) => {
    const location = useLocation();

    return (
        <Link
            to={url}
            className={cn(
                "w-full h-10 px-4 py-2 font-medium flex items-center justify-start gap-2 whitespace-nowrap hover:bg-shallow-background transition-colors",
                isCurrLinkActive(url, location.pathname, exactTailMatch) && activityIndicator && "bg-shallow-background/75",
                className,
            )}
        >
            {children}
        </Link>
    );
};

export const SecondaryButtonLink = ({ children, url, className }: { children: React.ReactNode; url: string; className?: string }) => {
    return (
        <Link
            to={url}
            className={cn(
                "flex items-center justify-center px-8 bg-card-background h-11 font-medium neumorphic_shadow hover:bg-card-background/85",
                className,
            )}
        >
            {children}
        </Link>
    );
};
