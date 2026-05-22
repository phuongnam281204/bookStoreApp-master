import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/book": "https://api.brazet.me",
      "/user": "https://api.brazet.me",
      "/order": "https://api.brazet.me",
      "/voucher": "https://api.brazet.me",
      "/health": "https://api.brazet.me",
      "/uploads": "https://api.brazet.me",
    },
  },
});
