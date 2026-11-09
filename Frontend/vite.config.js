import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // A page load of /book/:id (typed URL, reload) is the SPA's detail page, not the API.
      "/book": {
        target: "http://localhost:4001",
        bypass: (req) =>
          req.headers.accept?.includes("text/html") ? "/index.html" : undefined,
      },
      "/user": "http://localhost:4001",
      "/order": "http://localhost:4001",
      "/voucher": "http://localhost:4001",
      "/health": "http://localhost:4001",
      "/uploads": "http://localhost:4001",
    },
  },
});
