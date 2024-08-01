import { SuspenseFallback } from "@/components/ui/spinner";
import "@/src/globals.css";
import { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "@/src/pages/layout";
import { RedirectIfLoggedIn, RedirectIfNotLoggedIn } from "./pages/auth/guards";
import NotFoundPage from "./pages/not-found";
import ContextProviders from "./providers";

const HomePage = lazy(() => import("@/src/pages/page"));
const LoginPage = lazy(() => import("@/src/pages/auth/login/page"));
const SignUpPage = lazy(() => import("@/src/pages/auth/register/page"));
const OAuthCallbackPage = lazy(() => import("@/src/pages/auth/callback/page"));
const SettingsPage = lazy(() => import("@/src/pages/settings/page"));
const SettingsPageLayout = lazy(() => import("@/src/pages/settings/layout"));
const AccountSettingsPage = lazy(() => import("@/src/pages/settings/account/page"));
const SessionsPage = lazy(() => import("@/src/pages/settings/sessions/page"));
const ConfirmActionPage = lazy(() => import("@/src/pages/auth/confirm-action/page"));
const ChangePasswordPage = lazy(() => import("@/src/pages/auth/change-password/page"));
const RevokeSessionPage = lazy(() => import("@/src/pages/auth/revoke-session"));

const router = createBrowserRouter([
    {
        path: "auth/callback/:authProvider",
        element: (
            <Suspense fallback={<SuspenseFallback />}>
                <ContextProviders>
                    <OAuthCallbackPage />
                </ContextProviders>
            </Suspense>
        ),
    },
    {
        path: "auth/revoke-session",
        element: (
            <Suspense fallback={<SuspenseFallback />}>
                <ContextProviders>
                    <RevokeSessionPage />
                </ContextProviders>
            </Suspense>
        ),
    },
    {
        path: "auth/confirm-action",
        element: (
            <Suspense fallback={<SuspenseFallback />}>
                <ContextProviders>
                    <ConfirmActionPage />
                </ContextProviders>
            </Suspense>
        ),
    },
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {
                path: "",
                element: (
                    <Suspense fallback={<SuspenseFallback />}>
                        <HomePage />
                    </Suspense>
                ),
            },
            {
                path: "login",
                element: (
                    <>
                        <RedirectIfLoggedIn redirectTo="/dashboard" />
                        <Suspense fallback={<SuspenseFallback />}>
                            <LoginPage />
                        </Suspense>
                    </>
                ),
            },
            {
                path: "signup",
                element: (
                    <>
                        <RedirectIfLoggedIn redirectTo="/dashboard" />
                        <Suspense fallback={<SuspenseFallback />}>
                            <SignUpPage />
                        </Suspense>
                    </>
                ),
            },
            {
                path: "change-password",
                element: (
                    <>
                        <Suspense fallback={<SuspenseFallback />}>
                            <ChangePasswordPage />
                        </Suspense>
                    </>
                ),
            },
            {
                path: "settings",
                element: (
                    <>
                        <RedirectIfNotLoggedIn redirectTo="/login" />
                        <Suspense fallback={<SuspenseFallback />}>
                            <SettingsPageLayout />
                        </Suspense>
                    </>
                ),
                children: [
                    {
                        path: "",
                        element: (
                            <>
                                <Suspense fallback={<SuspenseFallback />}>
                                    <SettingsPage />
                                </Suspense>
                            </>
                        ),
                    },
                    {
                        path: "account",
                        element: (
                            <>
                                <Suspense fallback={<SuspenseFallback />}>
                                    <AccountSettingsPage />
                                </Suspense>
                            </>
                        ),
                    },
                    {
                        path: "sessions",
                        element: (
                            <>
                                <Suspense fallback={<SuspenseFallback />}>
                                    <SessionsPage />
                                </Suspense>
                            </>
                        ),
                    },
                ],
            },
            {
                path: "*",
                element: (
                    <Suspense fallback={<SuspenseFallback />}>
                        <NotFoundPage />
                    </Suspense>
                ),
            },
        ],
    },
]);

const rootEl = document.getElementById("root");
if (rootEl) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(<RouterProvider router={router} />);
}
