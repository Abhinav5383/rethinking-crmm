import { FormErrorMessage } from "@/components/ui/form-message";
import { AbsolutePositionedSpinner, LoadingSpinner } from "@/components/ui/spinner";
import { getCookie } from "@/lib/utils";
import useFetch from "@/src/hooks/fetch";
import { csrfStateCookieName } from "@shared/config";
import { GetAuthProviderFromString } from "@shared/lib/utils/convertors";
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
        const response = await useFetch(`/api/auth/callback/${actionIntent}/${provider}?code=${code}`);

        if (!response?.ok) {
            const data = await response.json();
            setErrorMsg(data?.message || "Something went wrong!");
            return;
        }

        navigate("/dashboard");
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
            urlCsrfState !== getCookie(csrfStateCookieName) ||
            !authProvider ||
            !code ||
            !urlCsrfState ||
            GetAuthProviderFromString(authProvider) === AuthProviders.UNKNOWN
        ) {
            return navigate("/");
        }

        submitCode(code, GetAuthProviderFromString(authProvider), actionIntent);
    }, [authProvider]);

    return (
        <div className="w-full h-[100vh] min-h-[720px] flex flex-col gap-4 items-center justify-center">
            {errorMsg ? (
                <>
                    <Helmet>
                        <title>Error | CRMM</title>
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
                        <title>... | CRMM</title>
                        <meta name="description" content="Authenticating..." />
                    </Helmet>
                    <LoadingSpinner />
                </>
            )}
        </div>
    );
};

export default OAuthCallbackPage;
