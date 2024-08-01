import { Outlet } from "react-router-dom";
import { ThemeProvider } from "./hooks/use-theme";
import AuthProvider from "./contexts/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import "@/src/globals.css";

const reactQueryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});

const ContextProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <QueryClientProvider client={reactQueryClient}>
            <AuthProvider>
                <ThemeProvider>
                    {children}
                    <Toaster />
                </ThemeProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
};

export default ContextProviders;
