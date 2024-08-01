import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import ContextProviders from "@/src/providers";
const Navbar = lazy(() => import("@/components/layout/Navbar/navbar"));

const RootLayout = () => {
    return (
        <ContextProviders>
            {/* A portal for the grid_bg_div inserted from the pages/page.tsx */}
            <div id="hero_section_bg_portal" className="absolute top-0 left-0 w-full" />

            <div className="w-full relative">
                <Suspense fallback={<div className="w-full flex items-center justify-center h-10 py-2">LOADING...</div>}>
                    <Navbar />
                </Suspense>
                <div className="container">
                    <Outlet />
                </div>
            </div>
        </ContextProviders>
    );
};

export default RootLayout;
