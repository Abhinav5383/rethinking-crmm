import { Outlet } from "react-router-dom";
import { ThemeProvider } from "./hooks/use-theme";
import AuthProvider from "./contexts/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
                <ThemeProvider>{children}</ThemeProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
};

export default ContextProviders;
