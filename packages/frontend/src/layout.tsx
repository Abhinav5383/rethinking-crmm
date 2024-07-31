import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import ContextProviders from "./providers";
import { Toaster } from "@/components/ui/sonner";
const Navbar = lazy(() => import("@/components/layout/Navbar/navbar"));

const RootLayout = () => {
    return (
        <ContextProviders>
            <div className="w-full relative">
                <Suspense fallback={<div className="w-full flex items-center justify-center h-10 py-2">LOADING...</div>}>
                    <Navbar />
                </Suspense>
                <div className="container">
                    <Outlet />
                </div>
            </div>
            <Toaster />
        </ContextProviders>
    );
};

export default RootLayout;
