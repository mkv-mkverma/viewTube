import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      "/api/youtube-suggestions": {
        target: "https://suggestqueries.google.com",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/youtube-suggestions/, "/complete/search"),
      },
    },
  },
});
