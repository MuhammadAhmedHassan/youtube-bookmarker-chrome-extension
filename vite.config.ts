import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        contentScript: resolve(__dirname, "src/scripts/contentScript.tsx"),
        background: resolve(__dirname, "src/scripts/background.ts"),
        popup: resolve(__dirname, "index.html"), // Add this line to include index.html
        // Add more entries here if needed, like other HTML files
      },
      output: {
        entryFileNames: "scripts/[name].js",
        chunkFileNames: "scripts/[name].js",
        assetFileNames: "scripts/[name].[ext]",
      },
    },
  },
});
