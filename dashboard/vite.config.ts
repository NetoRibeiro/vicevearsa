import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { departmenWatcherPlugin } from "./src/plugin/departmenWatcher";

export default defineConfig({
  plugins: [react(), departmenWatcherPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
