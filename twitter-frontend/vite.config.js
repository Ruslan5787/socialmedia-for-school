import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            "/api": {
                target: "http://localhost:27017",
                changeOrigin: true,
                secure: false,
            },
        },
    },
    define: {
        'process.env': {},
        'global': {},
    },
    resolve: {
        alias: {
            util: "util/",
            buffer: "buffer/",
            process: "process/browser",
        },
    },
});
