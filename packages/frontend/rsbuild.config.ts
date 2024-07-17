import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
    plugins: [pluginReact()],
    html: {
        tags: [
            {
                tag: "link",
                attrs: {
                    rel: "preconnect",
                    href: "https://fonts.googleapis.com",
                },
                head: true,
                append: true,
            },
            {
                tag: "link",
                attrs: {
                    rel: "stylesheet",
                    href: "https://fonts.googleapis.com/css2?&family=Inter:wght@100..900&display=swap",
                },
                head: true,
                append: true,
            },
        ],
    },
});
