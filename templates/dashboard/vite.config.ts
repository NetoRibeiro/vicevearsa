import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { departmentWatcherPlugin } from "./src/plugin/departmentWatcher";

export default defineConfig({
  plugins: [react(), departmentWatcherPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
