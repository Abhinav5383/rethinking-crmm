import type { LoggedInUserData } from "@shared/types";
import AddPasswordForm from "./add-password";
import RemovePasswordForm from "./remove-password";

interface Props {
    session: LoggedInUserData;
}

const ManagePasswords = ({ session }: Props) => {
    if (!session?.hasAPassword) {
        return (
            <div>
                <AddPasswordForm />
            </div>
        );
    }

    return (
        <div>
            <RemovePasswordForm />
        </div>
    );
};

export default ManagePasswords;
