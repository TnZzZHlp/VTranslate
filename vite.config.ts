import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        monkey({
            entry: "src/main.ts",
            userscript: {
                icon: "https://vitejs.dev/logo.svg",
                namespace: "npm/vite-plugin-monkey",
                match: [
                    "https://bbs.yamibo.com/thread-*",
                    "https://bbs.yamibo.com/forum.php*",
                ],
                version: "1.2.0",
            },
        }),
    ],
});
