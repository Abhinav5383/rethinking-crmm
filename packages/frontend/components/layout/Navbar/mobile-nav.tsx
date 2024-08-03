import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { NavMenuLink } from "./navbar";
import { useSession } from "@/src/contexts/auth";
import { SignOutBtn } from "./nav-button";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
    isNavMenuOpen: boolean;
    toggleNavMenu: (newState?: boolean) => void;
    NavLinks: {
        label: string;
        href: string;
    }[];
}

export const MobileNav = ({ isNavMenuOpen, toggleNavMenu, NavLinks }: MobileNavProps) => {
    const { session } = useSession();

    return (
        <div className={`mobile_navmenu w-full absolute top-[100%] left-0 duration-300 ${isNavMenuOpen && "menu_open"}`}>
            <div className="w-full flex flex-col items-center justify-center row-span-2 relative">
                <div className="absolute top-0 left-0 w-full h-full bg-background opacity-[0.975] dark:opacity-[0.985] z-[3]" />

                <div className="navlink_list_wrapper overscroll-contain w-full flex items-start justify-center z-20 h-[100vh] overflow-y-auto">
                    <ul className="navlink_list container pt-8 pb-28 px-6 flex flex-col items-start justify-start z-20 gap-2">
                        {NavLinks.map((link) => {
                            return (
                                <li key={`${link.href}`} className="w-full group">
                                    <NavMenuLink
                                        href={link.href}
                                        label={link.label}
                                        isDisabled={!isNavMenuOpen}
                                        toggleNavMenu={toggleNavMenu}
                                        className="mobile_nav_menu_link h-nav-item text-base hover:bg-shallower-background dark:hover:bg-shallow-background transition-colors flex items-center justify-center font-semibold text-muted-foreground"
                                    >
                                        {link.label}
                                    </NavMenuLink>
                                </li>
                            );
                        })}
                        {!!session?.id && (
                            <>
                                <li className="w-full flex flex-col gap-2 items-center justify-center mt-4">
                                    <div className="w-full flex items-center justify-center gap-4 h-nav-item">
                                        {session?.avatarImageUrl ? (
                                            <img
                                                src={session?.avatarImageUrl}
                                                alt={`${session?.fullName} `}
                                                className="h-full aspect-square rounded-full bg-bg-hover"
                                            />
                                        ) : (
                                            <span>{session?.fullName[0]}</span>
                                        )}
                                        <div className="flex flex-col items-start justify-center gap-1">
                                            <span className="leading-none font-semibold text-foreground/90">{session?.fullName}</span>
                                            <span className="leading-none text-muted-foreground">{session?.userName}</span>
                                        </div>
                                    </div>
                                </li>

                                {[
                                    {
                                        label: "Your profile",
                                        href: `/user/${session?.userName}`,
                                    },
                                    {
                                        label: "Dashboard",
                                        href: "/dashboard",
                                    },
                                    {
                                        label: "Settings",
                                        href: "/settings",
                                    },
                                ]?.map((link) => {
                                    return (
                                        <li key={`${link.href}`} className="w-full group flex items-center justify-center">
                                            <NavMenuLink
                                                href={link.href}
                                                label={link.label}
                                                isDisabled={!isNavMenuOpen}
                                                toggleNavMenu={toggleNavMenu}
                                                className="mobile_nav_menu_link h-nav-item hover:bg-shallower-background dark:hover:bg-shallow-background transition-colors flex items-center justify-center font-semibold text-muted-foreground"
                                            >
                                                {link.label}
                                            </NavMenuLink>
                                        </li>
                                    );
                                })}
                                <li className="w-full">
                                    <SignOutBtn
                                        disabled={!isNavMenuOpen}
                                        className="justify-center text-base font-semibold h-nav-item hover:bg-shallower-background dark:hover:bg-shallow-background"
                                    />
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

interface HamMenuProps {
    isNavMenuOpen: boolean;
    toggleNavMenu: (newState?: boolean) => void;
}

export const HamMenu = ({ isNavMenuOpen, toggleNavMenu }: HamMenuProps) => {
    const handleHamMenuClick = () => {
        toggleNavMenu();
    };

    return (
        <button
            type="button"
            className="navItemHeight w-10 flex items-center justify-center hover:bg-card-background cursor-pointer rounded-lg"
            onClick={handleHamMenuClick}
            aria-label="Menu"
        >
            <div className={`ham_menu_icon ${isNavMenuOpen && "ham_menu_open"} aspect-square w-full relative`}>
                <i className="ham_menu_line_1 block absolute top-[33%] left-1/2 h-[0.12rem] w-[50%] bg-current rounded-full translate-y-[-50%] translate-x-[-50%]" />
                <i className="ham_menu_line_2 block absolute top-[50%] left-1/2 h-[0.12rem] w-[50%] bg-current rounded-full translate-y-[-50%] translate-x-[-50%]" />
                <i className="ham_menu_line_3 block absolute top-[67%] left-1/2 h-[0.12rem] w-[50%] bg-current rounded-full translate-y-[-50%] translate-x-[-50%]" />
            </div>
        </button>
    );
};
