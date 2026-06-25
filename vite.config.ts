import { defineConfig } from "vite";
import { resolve } from "path";
import { copyFileSync } from "fs";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => {
  if (command === "serve") {
    // Dev server — normal SPA mode, chrome APIs are stubbed via index.html
    return { plugins: [react()] };
  }

  // Production build — full extension bundle
  return {
    root: "src/popup",
    plugins: [
      react(),
      {
        name: "copy-manifest",
        closeBundle() {
          copyFileSync(
            resolve(__dirname, "public/manifest.json"),
            resolve(__dirname, "dist/manifest.json")
          );
        },
      },
    ],
    build: {
      outDir: resolve(__dirname, "dist"),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, "src/popup/popup.html"),
          "popup-main": resolve(__dirname, "src/popup/main.tsx"),
          "service-worker": resolve(__dirname, "src/background/service-worker.ts"),
          "flights-scraper": resolve(__dirname, "src/content/flights-scraper.ts"),
        },
        output: {
          entryFileNames: "[name].js",
          chunkFileNames: "[name].js",
          assetFileNames: "[name].[ext]",
        },
      },
    },
  };
});
