import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // DOMAIN_NAME can be single or comma-separated
  const allowedHosts = env.DOMAIN_NAME
    ? env.DOMAIN_NAME.split(",").map((h) => h.trim())
    : [];

  return {
    plugins: [react(), tailwindcss()],

    server: {
      host: true,

      allowedHosts,

      proxy: {
        "/api": {
          target: env.BACKEND_SERVER_URL || "http://server:3000",
          changeOrigin: true,
          secure: false,
        },
      },

      hmr: env.DOMAIN_NAME
        ? {
            host: env.DOMAIN_NAME.split(",")[0].trim(),
          }
        : undefined,
    },

    preview: {
      allowedHosts,
    },
  };
});
