import { Outlet } from "react-router-dom";

const RootLayout = () => {
    return (
        <div>
            <p>HELLO THERE</p>
            <Outlet />
        </div>
    );
};

export default RootLayout;
