import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthActionIntent } from "@shared/types";
import { Helmet } from "react-helmet";
import OAuthProvidersWidget from "../oauth-providers";
import { Link } from "react-router-dom";

const SignUpPage = () => {
    return (
        <>
            <Helmet>
                <title>Signup | CRMM</title>
                <meta name="description" content="Signup for a CRMM account" />
            </Helmet>

            <main className="w-full flex items-center justify-center py-12 min-h-[100vh]">
                <Card className="w-full max-w-md relative">
                    <CardHeader className="mb-1">
                        <CardTitle>Sign Up</CardTitle>
                    </CardHeader>
                    <CardContent className="w-full flex flex-col items-start justify-start gap-4">
                        <div className="w-full flex flex-col items-start justify-start gap-2">
                            <p>Signup using any of the auth providers:</p>
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <OAuthProvidersWidget actionIntent={AuthActionIntent.SIGN_UP} />
                            </div>
                        </div>

                        <div className="w-full flex flex-col items-center justify-center gap-1 mt-4">
                            <p className="text-center text-foreground">
                                <span className="text-foreground-muted">Already have an account?&nbsp;</span>
                                <Link
                                    to="/login"
                                    aria-label="Login"
                                    className="text-foreground font-semibold decoration-[0.1rem] hover:underline underline-offset-2"
                                >
                                    Login
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </>
    );
};

export default SignUpPage;
