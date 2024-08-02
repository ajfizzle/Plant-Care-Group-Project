import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build", // Ensure this matches the directory expected by the server
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/graphql": {
        target: "http://localhost:3001",
        secure: false,
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:3001",
        secure: false,
        changeOrigin: true,
      },
    },
  },
  define: {
    "process.env": process.env,
  },
});
