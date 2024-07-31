import { DiscordIcon, GoogleIcon, GithubIcon, GitlabIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { AuthActionIntent, AuthProviders } from "@shared/types";
import React, { useState } from "react";
import { AbsolutePositionedSpinner } from "@/components/ui/spinner";
import useFetch from "@/src/hooks/fetch";

export const ConfiguredAuthProviders = [AuthProviders.GITHUB, AuthProviders.DISCORD, AuthProviders.GOOGLE, AuthProviders.GITLAB];

export const authProvidersList = [
    {
        name: AuthProviders.GITHUB,
        icon: <GithubIcon size="1.3rem" className="text-foreground" />,
    },
    {
        name: AuthProviders.DISCORD,
        icon: <DiscordIcon size="1.4rem" className="text-foreground" />,
    },
    {
        name: AuthProviders.GOOGLE,
        icon: <GoogleIcon size="1.4rem" className="text-foreground" />,
    },
    {
        name: AuthProviders.GITLAB,
        icon: <GitlabIcon size="1.5rem" className="text-foreground" />,
    },
];

const OAuthProvidersWidget = ({ actionIntent = AuthActionIntent.SIGN_IN }: { actionIntent: AuthActionIntent }) => {
    const [loading, setLoading] = useState(false);

    return (
        <>
            {authProvidersList?.map((provider) => {
                return (
                    <React.Fragment key={provider.name}>
                        <Button
                            onClick={async () => {
                                setLoading(true);
                                const signinUrl = await getOAuthUrl(provider.name, actionIntent);
                                window.location.href = signinUrl;
                            }}
                            aria-label={`Continue using ${provider.name}`}
                            className="w-full font-medium capitalize"
                            variant="secondary"
                        >
                            <i className="min-w-6 flex items-center justify-start">{provider.icon}</i>
                            {provider.name}
                        </Button>
                    </React.Fragment>
                );
            })}
            {loading === true && <AbsolutePositionedSpinner />}
        </>
    );
};

export default OAuthProvidersWidget;

export const getOAuthUrl = async (provider: AuthProviders, actionIntent: AuthActionIntent) => {
    const response = await useFetch(`/api/auth/${actionIntent}/get-oauth-url/${provider}`);
    return (await response.json())?.url || "";
};
