import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormErrorMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormSchema } from "@shared/schemas/auth";
import { AuthActionIntent } from "@shared/types";
import { LogInIcon } from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import type { z } from "zod";
import OAuthProvidersWidget from "../oauth-providers";

const LoginPage = () => {
    const [formError, setFormError] = useState("");
    const loginForm = useForm<z.infer<typeof LoginFormSchema>>({
        resolver: zodResolver(LoginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleCredentialLogin = async () => {};

    return (
        <>
            <Helmet>
                <title>Login | CRMM</title>
                <meta name="description" content="Log into your CRMM account" />
            </Helmet>

            <main className="full_page w-full flex items-center justify-center py-12">
                <Card className="w-full max-w-md relative">
                    <CardHeader className="mb-1">
                        <CardTitle>Log In</CardTitle>
                    </CardHeader>
                    <CardContent className="w-full flex flex-col items-start justify-start gap-4">
                        <Form {...loginForm}>
                            <form
                                onSubmit={loginForm.handleSubmit(handleCredentialLogin)}
                                name="Login"
                                className="w-full flex flex-col items-center justify-center gap-form-elements"
                            >
                                <FormField
                                    control={loginForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <>
                                            <FormItem>
                                                <FormLabel>
                                                    Email
                                                    <FormMessage />
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        placeholder="example@abc.com"
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                            field.onChange(e);
                                                            setFormError("");
                                                        }}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        </>
                                    )}
                                />

                                <FormField
                                    control={loginForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <>
                                            <FormItem>
                                                <FormLabel>
                                                    Password
                                                    <FormMessage />
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="********"
                                                        type="password"
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                            field.onChange(e);
                                                            setFormError("");
                                                        }}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        </>
                                    )}
                                />

                                {formError && <FormErrorMessage text={formError} />}

                                <Button type="submit" aria-label="Login" className="w-full h-9">
                                    <LogInIcon className="w-[1.1rem] h-[1.1rem]" />
                                    Login
                                </Button>
                            </form>
                        </Form>

                        <div className="w-full flex items-center gap-4">
                            <hr className="bg-shallow-background border-none w-full h-[0.1rem] flex-1" />
                            <p className="shrink-0 text-sm text-extra-muted-foreground">OR</p>
                            <hr className="bg-shallow-background border-none w-full h-[0.1rem] flex-1" />
                        </div>

                        <div className="w-full flex flex-col items-start justify-start gap-2">
                            <p>Login using:</p>
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <OAuthProvidersWidget actionIntent={AuthActionIntent.SIGN_IN} />
                            </div>
                        </div>

                        <div className="w-full flex flex-col items-center justify-center gap-1 mt-4">
                            <p className="text-center text-foreground">
                                <span className="text-foreground-muted">Don't have an account?&nbsp;</span>
                                <Link
                                    to="/signup"
                                    aria-label="Sign up"
                                    className="text-foreground font-semibold decoration-[0.1rem] hover:underline underline-offset-2"
                                >
                                    Sign up
                                </Link>
                            </p>
                            <p className="text-center">
                                <span className="text-foreground-muted">Forgot password?&nbsp;</span>
                                <Link
                                    to="/change-password"
                                    aria-label="Change password"
                                    className="text-foreground font-semibold decoration-[0.1rem] hover:underline underline-offset-2"
                                >
                                    Change password
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </>
    );
};

export default LoginPage;
