import { BrandIcon } from "@/components/icons";
import "./styles.css";

import { SITE_NAME_SHORT } from "@shared/config";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSession } from "./contexts/auth";
import { LoadingSpinner } from "@/components/ui/spinner";
import { SecondaryButtonLink } from "@/components/ui/link";

const HomePage = () => {
    const { session } = useSession();
    // The animation keyframes in "@/app/styles.css" need to be updated according to the number of items in the list
    const showcaseItems = ["Mods", "Plugins", "Resource Packs", "Modpacks", "Shaders", "Mods"];

    return (
        <>
            <Helmet>
                <title>{SITE_NAME_SHORT}</title>
                <meta name="description" content="All your favourite Cosmic Reach mods" />
            </Helmet>

            <main className="w-full">
                <section className="full_page w-full flex flex-col items-center justify-center">
                    <BrandIcon size="16rem" className="text-accent-foreground" />
                    <div className="w-full flex flex-col items-center justify-center">
                        <h1 className="text-2xl lg:text-4xl font-medium text-foreground text-center">Cosmic Reach Mod Manager</h1>

                        <h2 className="h-10 lg:h-14 mb-2 overflow-hidden">
                            <span className="hero_section_showcase flex flex-col items-center justify-center">
                                {showcaseItems?.map((item, index) => {
                                    return (
                                        <strong
                                            key={`${item}${
                                                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                                index
                                            }`}
                                            className="flex font-bold items-center justify-center h-10 lg:h-14 text-2xl lg:text-4xl bg-clip-text bg-accent-background text-transparent bg-cover bg-gradient-to-b from-rose-200 to-accent-background via-accent-background leading-loose"
                                            // @ts-ignore
                                            style={{ "--index": index + 1 }}
                                        >
                                            {item}
                                        </strong>
                                    );
                                })}
                            </span>
                        </h2>

                        <div className="flex flex-col items-center justify-center gap-1">
                            <h2 className="w-full text-center flex flex-wrap items-center justify-center text-lg lg:text-xl">
                                The best place for your&nbsp;
                                <a
                                    href="https://finalforeach.itch.io/cosmic-reach"
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={"Cosmic Reach"}
                                    className="text-accent-foreground underline-offset-3 hover:underline"
                                >
                                    Cosmic Reach
                                </a>
                                &nbsp;mods.
                            </h2>
                            <h2 className="text-lg lg:text-xl flex text-center text-foreground-muted">
                                Discover, play, and create content, all in one spot.
                            </h2>
                        </div>
                    </div>

                    <div className="flex gap-4 md:gap-8 flex-wrap items-center justify-center mt-6">
                        <Link to={"/mods"}>
                            <Button size={"lg"} aria-label="Explore mods" tabIndex={-1}>
                                Explore mods
                            </Button>
                        </Link>

                        {session === undefined ? (
                            <LoadingSpinner size="sm" />
                        ) : !session?.id ? (
                            <SecondaryButtonLink url="/signup">Sign Up</SecondaryButtonLink>
                        ) : (
                            <SecondaryButtonLink url="/dashboard/projects">Dashboard</SecondaryButtonLink>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
};

export default HomePage;
