import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link2Icon, LinkIcon, SettingsIcon, Trash2Icon } from "lucide-react";
import { authProvidersList } from "../../auth/oauth-providers";
import { Capitalize } from "@shared/lib/utils";
import { AuthActionIntent, type AuthProviders, type LinkedProvidersListData } from "@shared/types";
import { getAuthProviderFromString } from "@shared/lib/utils/convertors";
import { useState } from "react";
import useFetch from "@/src/hooks/fetch";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/spinner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const ManageAuthProviders = ({
    linkedAuthProviders,
    refetchLinkedAuthProviders,
}: { linkedAuthProviders: LinkedProvidersListData[]; refetchLinkedAuthProviders: () => Promise<void> }) => {
    const [isLoading, setIsLoading] = useState<{ value: boolean; provider: AuthProviders | null }>({ value: false, provider: null });

    const redirectToOauthPage = async (provider: AuthProviders) => {
        try {
            if (isLoading.value === true) return;
            setIsLoading({ value: true, provider: provider });

            const response = await useFetch(`/api/auth/${AuthActionIntent.LINK_PROVIDER}/get-oauth-url/${provider}`);
            const result = await response.json();

            if (!response.ok || !result?.url) {
                setIsLoading({ value: false, provider: null });
                return toast.error(result?.message || "Error");
            }

            toast.success("Redirecting...");
            window.location.href = result.url;
        } catch (err) {
            console.error(err);
            setIsLoading({ value: false, provider: null });
        }
    };

    const removeAuthProvider = async (provider: AuthProviders) => {
        try {
            if (isLoading.value === true) return;
            setIsLoading({ value: true, provider: provider });

            const response = await useFetch(`/api/auth/unlink-provider/${provider}`);
            const result = await response.json();

            if (!response.ok || !result?.success) {
                return toast.error(result?.message || "Error");
            }

            await refetchLinkedAuthProviders();
            toast.success(result?.message || "Success");
        } finally {
            setIsLoading({ value: false, provider: null });
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"secondary"}>
                    <SettingsIcon className="w-btn-icon h-btn-icon" />
                    Manage providers
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Linked auth providers</DialogTitle>
                    <VisuallyHidden>
                        <DialogDescription>Manage login auth provider for you account</DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>
                <Accordion type="single" collapsible className="w-full">
                    <>
                        {authProvidersList.map((authProvider) => {
                            let additionalProviderDetails = null;
                            for (const linkedProvider of linkedAuthProviders) {
                                if (getAuthProviderFromString(linkedProvider.providerName) === authProvider.name) {
                                    additionalProviderDetails = linkedProvider;
                                    break;
                                }
                            }

                            return (
                                <AccordionItem key={authProvider.name} value={authProvider.name} className="border-transparent">
                                    <AccordionTrigger className="text-base">
                                        <div className="flex items-center justify-start gap-2">
                                            <i className="w-6 flex items-center justify-start">{authProvider.icon}</i>
                                            {Capitalize(authProvider.name)}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="w-full flex items-center justify-between">
                                        <p className="text-muted-foreground">
                                            {additionalProviderDetails ? (
                                                <span className="font-medium ">{additionalProviderDetails.providerAccountEmail}</span>
                                            ) : (
                                                <>Link {Capitalize(authProvider.name)} to your account</>
                                            )}
                                        </p>

                                        {additionalProviderDetails ? (
                                            <Button
                                                variant={"secondary-destructive"}
                                                disabled={isLoading.value}
                                                onClick={() => removeAuthProvider(getAuthProviderFromString(authProvider.name))}
                                            >
                                                {isLoading.provider === getAuthProviderFromString(authProvider.name) ? (
                                                    <LoadingSpinner size="xs" />
                                                ) : (
                                                    <Trash2Icon className="w-btn-icon h-btn-icon" />
                                                )}
                                                Remove
                                            </Button>
                                        ) : (
                                            <Button
                                                variant={"secondary"}
                                                onClick={() => redirectToOauthPage(getAuthProviderFromString(authProvider.name))}
                                                disabled={isLoading.value}
                                            >
                                                {isLoading.provider === getAuthProviderFromString(authProvider.name) ? (
                                                    <LoadingSpinner size="xs" />
                                                ) : (
                                                    <Link2Icon className="w-btn-icon h-btn-icon" />
                                                )}
                                                Link
                                            </Button>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </>
                </Accordion>
            </DialogContent>
        </Dialog>
    );
};

export default ManageAuthProviders;
