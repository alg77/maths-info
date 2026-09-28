import { defineConfig } from "vite";
export default defineConfig({
  base: "./",
  build: { target: "es2022", rollupOptions: { input: "index.source.html" } },
  server: { port: 5173, strictPort: true, open: '/index.source.html' },
});
