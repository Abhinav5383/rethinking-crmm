import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboardIcon, LogOutIcon, Settings2Icon, UserIcon } from "lucide-react";
import { AuthContext } from "@/src/contexts/auth";
import { LoadingSpinner } from "@/components/ui/spinner";
import { ButtonLink } from "@/components/ui/link";
import type { LoggedInUserData } from "@shared/types";
import { Separator } from "@/components/ui/separator";
import CopyBtn from "@/components/ui/copy-btn";

export const LoginButton = ({
    className,
    onClick,
}: {
    className?: string;
    onClick?: () => void;
}) => {
    return (
        <Button
            className={cn("bg-card-background hover:bg-card-background/85 text-foreground-bright dark:text-foreground-bright", className)}
            variant={"secondary"}
            aria-label="Login"
            tabIndex={-1}
            onClick={onClick}
        >
            Log In
        </Button>
    );
};

const NavButton = ({ toggleNavMenu }: { toggleNavMenu: (newState?: boolean) => void }) => {
    const { session } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);

    if (session === undefined) {
        return <LoadingSpinner size="sm" />;
    }

    if (!session?.id) {
        return (
            <Link to={"/login"}>
                <LoginButton
                    onClick={() => {
                        toggleNavMenu(false);
                    }}
                />
            </Link>
        );
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    size="lg"
                    variant="ghost"
                    aria-label="Profile icon"
                    className="p-0 m-0 h-fit rounded-full w-fit hover:bg-transparent dark:hover:bg-transparent no_neumorphic_shadow"
                >
                    <div className="flex items-center justify-center aspect-square p-1 h-nav-item hover:bg-card-background rounded-full">
                        {session?.avatarImageUrl ? (
                            <img
                                src={session?.avatarImageUrl}
                                alt={`${session?.userName} `}
                                className="w-full aspect-square rounded-full bg-bg-hover"
                            />
                        ) : (
                            <span>{session?.fullName[0]}</span>
                        )}
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="max-w-md min-w-72 mx-[auto] mr-4" align="center">
                <ProfileDropDown session={session} isPopoverOpen={isOpen} />
            </PopoverContent>
        </Popover>
    );
};

export default NavButton;

type Props = {
    className?: string;
    disabled?: boolean;
};

export const SignOutBtn = ({ className, disabled = false }: Props) => {
    const [loading, setLoading] = useState(false);
    const { logout } = useContext(AuthContext);

    const handleClick = async () => {
        if (loading) return;
        setLoading(true);
        await logout();
    };

    return (
        <Button
            variant={"ghost-destructive"}
            className={cn("w-full justify-start no_neumorphic_shadow", className)}
            onClick={handleClick}
            disabled={disabled || loading}
            tabIndex={0}
        >
            {loading ? <LoadingSpinner size="xs" /> : <LogOutIcon className="w-btn-icon h-btn-icon" />}
            Sign out
        </Button>
    );
};

const ProfileDropDown = ({ session, isPopoverOpen }: { session: LoggedInUserData; isPopoverOpen: boolean }) => {
    return (
        <div className="w-full flex flex-col items-center justify-center gap-3">
            <div className="w-full flex items-center justify-center gap-2">
                <div className="flex items-center justify-center aspect-square p-1 h-14 hover:bg-card-background rounded-full">
                    {session?.avatarImageUrl ? (
                        <img
                            src={session?.avatarImageUrl}
                            alt={`${session?.userName} `}
                            className="w-full aspect-square rounded-full bg-bg-hover"
                        />
                    ) : (
                        <span>{session?.fullName[0]}</span>
                    )}
                </div>

                <div className="w-full flex flex-col items-start justify-center overflow-x-auto">
                    <h2 className="text-lg leading-none font-semibold">{session.fullName}</h2>
                    <div className="flex items-center justify-start gap-1">
                        <p className="leading-none">
                            <span className="leading-none select-none">@</span>
                            {session.userName}
                        </p>
                        <CopyBtn text={session.userName} />
                    </div>
                </div>
            </div>

            <Separator />

            <div className="w-full flex flex-col items-center justify-center gap-1">
                <ButtonLink url={`/user/${session.userName}`} exactTailMatch={false}>
                    <UserIcon className="w-btn-icon h-btn-icon" />
                    Your profile
                </ButtonLink>
                <ButtonLink url="/dashboard" exactTailMatch={false}>
                    <LayoutDashboardIcon className="w-btn-icon h-btn-icon" />
                    Dashboard
                </ButtonLink>
                <ButtonLink url="/settings" exactTailMatch={false}>
                    <Settings2Icon className="w-btn-icon h-btn-icon" />
                    Settings
                </ButtonLink>
            </div>

            <Separator />

            <SignOutBtn disabled={!isPopoverOpen} />
        </div>
    );
};
