import { FormErrorMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/spinner";
import { getCookie } from "@/lib/utils";
import useFetch from "@/src/hooks/fetch";
import { CSRF_STATE_COOKIE_NAME, SITE_NAME_SHORT } from "@shared/config";
import { getAuthProviderFromString } from "@shared/lib/utils/convertors";
import { AuthActionIntent, AuthProviders } from "@shared/types";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

const OAuthCallbackPage = () => {
    const [errorMsg, setErrorMsg] = useState("");
    const [searchParams] = useSearchParams();
    const { authProvider } = useParams();
    const navigate = useNavigate();

    const submitCode = async (code: string, provider: AuthProviders, actionIntent: AuthActionIntent) => {
        let redirectUrl = "/dashboard";
        try {
            const response = await useFetch(`/api/auth/callback/${actionIntent}/${provider}?code=${code}`);
            const data = await response.json();

            redirectUrl = data?.redirect || redirectUrl;
            redirectUrl += `?announce=${encodeURIComponent(data?.message)}`;

            if (!response?.ok) {
                setErrorMsg(data?.message || "Something went wrong!");
                return;
            }
            navigate(redirectUrl);
        } catch (error) {
            console.error(error);
            setErrorMsg(`${error}` || "Something went wrong!");
        }
    };

    const urlCsrfState = searchParams.get("state");
    const code = searchParams.get("code");

    const actionIntent = urlCsrfState?.startsWith(AuthActionIntent.SIGN_IN)
        ? AuthActionIntent.SIGN_IN
        : urlCsrfState?.startsWith(AuthActionIntent.SIGN_UP)
          ? AuthActionIntent.SIGN_UP
          : AuthActionIntent.LINK_PROVIDER;

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (
            urlCsrfState !== getCookie(CSRF_STATE_COOKIE_NAME) ||
            !authProvider ||
            !code ||
            !urlCsrfState ||
            getAuthProviderFromString(authProvider) === AuthProviders.UNKNOWN
        ) {
            return navigate("/");
        }

        submitCode(code, getAuthProviderFromString(authProvider), actionIntent);
    }, [authProvider]);

    return (
        <div className="w-full h-[100vh] min-h-[720px] flex flex-col gap-4 items-center justify-center">
            {errorMsg ? (
                <>
                    <Helmet>
                        <title>Error | {SITE_NAME_SHORT}</title>
                        <meta name="description" content={errorMsg} />
                    </Helmet>
                    <div className="w-full max-w-md flex flex-col gap-4 items-center justify-center">
                        <FormErrorMessage text={errorMsg} />
                        {actionIntent === AuthActionIntent.SIGN_IN ? (
                            <Link className="hover:underline underline-offset-2" to={"/login"}>
                                Log In
                            </Link>
                        ) : actionIntent === AuthActionIntent.SIGN_UP ? (
                            <Link className="hover:underline underline-offset-2" to={"/signup"}>
                                Sign Up
                            </Link>
                        ) : (
                            <Link className="hover:underline underline-offset-2" to={"/settings/account"}>
                                Settings
                            </Link>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <Helmet>
                        <title>... | {SITE_NAME_SHORT}</title>
                        <meta name="description" content="Authenticating..." />
                    </Helmet>
                    <LoadingSpinner />
                </>
            )}
        </div>
    );
};

export default OAuthCallbackPage;
