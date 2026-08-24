import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {

      // ==================================================
      // AUTH
      // ==================================================

      "/auth": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },


      // ==================================================
      // ADMIN APIs
      // ==================================================

      "/admin/dashboard/stats": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },

      "/admin/departments/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },

      "/admin/users/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },


      // ==================================================
      // STUDENT API
      // IMPORTANT:
      // DO NOT USE "/student" HERE
      // ==================================================

      "/student/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },


      // ==================================================
      // STUDENT FILE / SUBMISSION APIs
      // ==================================================

      "/student/assignments/upload": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },

      "/student/assignments/bulk-upload": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },


      // ==================================================
      // PROFESSOR APIs
      // ==================================================

      "/professor/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },

      "/professor/review": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },

      "/professor/assignments": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },


      // ==================================================
      // HOD APIs
      // ==================================================

      "/hod/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },


      // ==================================================
      // GENERAL API
      // ==================================================

      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});