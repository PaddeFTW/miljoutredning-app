import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        exclude: ["@kg/core", "@kg/data", "@kg/product"]
      })
    ],
    resolve: {
      alias: {
        "@kg/core": resolve(__dirname, "../../packages/core/src/index.ts"),
        "@kg/data": resolve(__dirname, "../../packages/data/src/index.ts"),
        "@kg/product": resolve(__dirname, "../../packages/product/src/index.ts")
      }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "electron/main.ts")
        }
      }
    }
  },
  preload: {
    plugins: [
      externalizeDepsPlugin({
        exclude: ["@kg/core", "@kg/data", "@kg/product"]
      })
    ],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "electron/preload.ts")
        }
      }
    }
  },
  renderer: {
    root: resolve(__dirname),
    plugins: [react()],
    resolve: {
      alias: {
        "@kg/core": resolve(__dirname, "../../packages/core/src/index.ts"),
        "@kg/data": resolve(__dirname, "../../packages/data/src/index.ts"),
        "@kg/product": resolve(__dirname, "../../packages/product/src/index.ts")
      }
    },
    server: {
      host: "127.0.0.1",
      port: 5174,
      strictPort: true
    },
    build: {
      outDir: resolve(__dirname, "out/renderer"),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          index: resolve(__dirname, "index.html")
        }
      }
    }
  }
});
