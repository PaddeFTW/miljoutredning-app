import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "electron/main.ts")
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "electron/preload.ts")
        }
      }
    }
  },
  renderer: {
    root: ".",
    plugins: [react()],
    server: {
      host: "127.0.0.1",
      port: 5174,
      strictPort: true
    },
    build: {
      outDir: "out/renderer",
      emptyOutDir: false
    }
  }
});
