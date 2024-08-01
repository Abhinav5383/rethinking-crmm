import { PanelContent, PanelLayout, SidePanel } from "@/components/layout/cards-layout";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/link";
import { SITE_NAME_SHORT } from "@shared/config";
import { UserIcon, MonitorSmartphone } from "lucide-react";
import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";

const SettingsPageLayout = () => {
    return (
        <>
            <Helmet>
                <title>Settings | {SITE_NAME_SHORT}</title>
                <meta name="description" content="Settings" />
            </Helmet>

            <main className="w-full">
                <PanelLayout>
                    <SidePanel className="gap-2">
                        <CardHeader className="p-0">
                            <CardTitle className="text-xl mb-2">Settings</CardTitle>
                        </CardHeader>
                        <ButtonLink url="/settings/account">
                            <UserIcon className="size-4" />
                            Account
                        </ButtonLink>
                        <ButtonLink url="/settings/sessions">
                            <MonitorSmartphone className="size-4" />
                            Sessions
                        </ButtonLink>
                    </SidePanel>
                    <PanelContent>
                        <Outlet />
                    </PanelContent>
                </PanelLayout>
            </main>
        </>
    );
};

export default SettingsPageLayout;
