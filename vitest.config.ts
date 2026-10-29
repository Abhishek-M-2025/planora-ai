import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    alias: {
      "@/ui": path.resolve(__dirname, "./src/components/ui"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
