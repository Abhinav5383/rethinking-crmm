import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type React from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import "@/src/globals.css";

type SidePanelProps = {
    className?: string;
    children: React.ReactNode;
};

export const SidePanel = ({ children, className }: SidePanelProps) => {
    return (
        <Card className={cn("px-4 py-4 rounded shadow-none w-full lg:w-72 xl:w-80 flex flex-col items-start justify-start", className)}>
            {children}
        </Card>
    );
};

type PanelContentProps = {
    className?: string;
    children: React.ReactNode;
};

export const PanelContent = ({ children, className }: PanelContentProps) => {
    return (
        <section className={cn("grow w-full max-w-full flex flex-col gap-panel-cards items-center justify-start rounded", className)}>
            {children}
        </section>
    );
};

type Props = {
    children: React.ReactNode;
};

export const PanelLayout = ({ children }: Props) => {
    return (
        <div className="w-full gap-panel-cards relative grid place-items-start grid-cols-1 lg:grid-cols-[min-content_1fr]">{children}</div>
    );
};
