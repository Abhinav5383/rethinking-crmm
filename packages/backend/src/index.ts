import { Hono } from "hono";
import { SITE_NAME_SHORT } from "@root/config";

const app = new Hono();

app.get("/", (c) => {
    return c.text(`${SITE_NAME_SHORT}`);
});

export default app;
