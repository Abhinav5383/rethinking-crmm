import { Button } from "@/components/ui/button";
import { SITE_NAME_SHORT } from "@shared/config";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <>
            <Helmet>
                <title>Page not found | {SITE_NAME_SHORT}</title>
                <meta name="description" content="We couldn't find the page you are looking for." />
            </Helmet>
            <div className="w-full min-h-[100vh] flex flex-col items-center justify-center gap-4">
                <div className="headings">
                    <h1 className="w-full text-[3rem] leading-none font-bold flex items-center justify-center text-center">
                        404 | Page not found.
                    </h1>
                </div>
                <p className="text-lg dark:text-foreground-muted max-w-xl flex items-center justify-center text-center">
                    Sorry, we couldn't find the page you're looking for.
                </p>

                <Link to="/" className="mt-4">
                    <Button className="text-foreground" variant={"link"} aria-label="Go to home page">
                        <span className="text-lg">Home</span>
                    </Button>
                </Link>
            </div>
        </>
    );
}
