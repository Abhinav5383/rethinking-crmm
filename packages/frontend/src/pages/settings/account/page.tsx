import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/src/contexts/auth";
import { Helmet } from "react-helmet";
import EditProfileDialog from "./edit-profile";
import { useQuery } from "@tanstack/react-query";
import useFetch from "@/src/hooks/fetch";
import type { LinkedProvidersListData } from "@shared/types";
import ManagePasswords from "./password/page";
import { SITE_NAME_SHORT } from "@shared/config";

const getLinkedAuthProviders = async (userId?: number) => {
    if (!userId) return null;
    try {
        const res = await useFetch("/api/user/get-linked-auth-providers");
        return ((await res.json()) || []) as LinkedProvidersListData[];
    } catch (err) {
        console.error(err);
        return null;
    }
};

const AccountSettingsPage = () => {
    const { session, isFetchingData, validateSession } = useSession();
    const linkedAuthProviders = useQuery({ queryKey: ["linked-auth-providers"], queryFn: async () => getLinkedAuthProviders(session?.id) });

    if (!session?.id) return null;

    return (
        <>
            <Helmet>
                <title>Account settings | {SITE_NAME_SHORT}</title>
                <meta name="description" content="Your CRMM account settings" />
            </Helmet>

            <Card className="w-full p-0">
                <CardHeader className="w-full flex flex-row items-center justify-between py-2">
                    <CardTitle className="flex w-fit">User profile</CardTitle>
                    <EditProfileDialog
                        session={session}
                        isFetchingData={isFetchingData}
                        linkedAuthProviders={linkedAuthProviders.data || null}
                        validateSession={validateSession}
                    />
                </CardHeader>
                <CardContent>
                    <div className="w-full flex flex-col items-center justify-center my-2">
                        <div className="w-full flex flex-wrap items-center justify-start gap-6">
                            <div className="flex grow sm:grow-0 items-center justify-center">
                                {session?.avatarImageUrl ? (
                                    <img
                                        src={session?.avatarImageUrl}
                                        alt={`${session?.userName} `}
                                        className="h-24 aspect-square rounded-full bg-shallow-background"
                                    />
                                ) : (
                                    <span>{session?.fullName[0]}</span>
                                )}
                            </div>
                            <div className="grow max-w-full flex flex-col items-start justify-center">
                                <h1 className="flex w-full items-center sm:justify-start justify-center text-xl font-semibold">
                                    {session?.fullName}
                                </h1>
                                <div className="overflow-x-auto flex w-full items-center sm:justify-start justify-center">
                                    <p className="text-foreground py-1">
                                        <span role="img" aria-hidden className="text-extra-muted-foreground select-none">
                                            @
                                        </span>
                                        {session?.userName}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full p-0">
                <CardHeader>
                    <CardTitle>Account security</CardTitle>
                </CardHeader>
                <CardContent className="gap-form-elements">
                    <div className="flex flex-col items-start justify-center max-w-md w-full gap-1.5">
                        <Label className="">Email</Label>
                        <Input readOnly value={session?.email} />
                    </div>

                    <div className="w-full flex flex-wrap items-end gap-x-8 justify-between gap-2">
                        <div className="flex flex-col items-start justify-start gap-1.5 flex-shrink-0">
                            <Label className="">Password</Label>
                            {session.hasAPassword ? <p>Change your account password</p> : <p>Add a password to use credentials login</p>}
                        </div>

                        <ManagePasswords session={session} />
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default AccountSettingsPage;
