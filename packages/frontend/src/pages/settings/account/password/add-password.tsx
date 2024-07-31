import { Button, CancelButton } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormItem, FormLabel, FormField, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { addPasswordFormSchema } from "@shared/schemas/settings";
import { KeyRoundIcon, PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

const AddPasswordForm = () => {
    const form = useForm<z.infer<typeof addPasswordFormSchema>>({
        resolver: zodResolver(addPasswordFormSchema),
        defaultValues: {
            newPassword: "",
            confirmNewPassword: "",
        },
    });

    form.watch();

    const addNewPassword = (values: z.infer<typeof addPasswordFormSchema>) => {
        console.log(values);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"secondary"}>
                    <KeyRoundIcon className="w-btn-icon h-btn-icon" />
                    Add password
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add password</DialogTitle>
                    <DialogDescription>You will be able to use this password to log into your account</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        className="flex flex-col items-center justify-start gap-form-elements"
                        onSubmit={form.handleSubmit(addNewPassword)}
                    >
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        New password
                                        <FormMessage />
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} type="password" placeholder="Your new password" spellCheck={false} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmNewPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Confirm password
                                        <FormMessage />
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} type="password" placeholder="Re-enter your password" spellCheck={false} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <DialogClose asChild>
                                <CancelButton />
                            </DialogClose>
                            <Button
                                disabled={
                                    !form.getValues().confirmNewPassword ||
                                    !form.getValues()?.newPassword ||
                                    form.getValues().newPassword !== form.getValues().confirmNewPassword
                                }
                            >
                                <PlusIcon className="w-btn-icon-lg h-btn-icon-lg" />
                                Add password
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AddPasswordForm;
