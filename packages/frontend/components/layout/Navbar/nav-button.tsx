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
}: {
    className?: string;
}) => {
    return (
        <Button
            className={cn("bg-card-background hover:bg-card-background/85 text-foreground-bright dark:text-foreground-bright", className)}
            variant={"secondary"}
            aria-label="Login"
            tabIndex={-1}
        >
            Log In
        </Button>
    );
};

const NavButton = () => {
    const { session, logout: _logout } = useContext(AuthContext);

    if (session === undefined) {
        return <LoadingSpinner size="sm" />;
    }

    if (!session?.id) {
        return (
            <Link to={"/login"}>
                <LoginButton />
            </Link>
        );
    }

    return (
        <Popover>
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
                <ProfileDropDown session={session} />
            </PopoverContent>
        </Popover>
    );
};

export default NavButton;

type Props = {
    className?: string;
    labelClassName?: string;
};

export const SignOutBtn = ({ ...props }: Props) => {
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
            className="w-full justify-start no_neumorphic_shadow"
            onClick={handleClick}
            disabled={loading}
            tabIndex={0}
        >
            {loading ? <LoadingSpinner size="xs" /> : <LogOutIcon className="w-btn-icon h-btn-icon" />}
            Sign Out
        </Button>
    );
};

const ProfileDropDown = ({ session }: { session: LoggedInUserData }) => {
    return (
        <div className="w-full flex flex-col items-center justify-center gap-3">
            <div className="w-full flex flex-col px-3 items-start justify-start overflow-x-auto">
                <h2 className="text-lg font-semibold">{session.fullName}</h2>
                <div className="flex items-center justify-start gap-1 pb-1">
                    <p>
                        <span className="select-none">@</span>
                        {session.userName}
                    </p>
                    <CopyBtn text={session.userName} />
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

            <SignOutBtn />
        </div>
    );
};
