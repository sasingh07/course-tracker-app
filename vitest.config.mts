import path from "node:path";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Same "@/..." import paths as the app (see tsconfig.json).
    alias: { "@": path.resolve(import.meta.dirname) },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    // Supabase URL/key from .env.local, test accounts from .env.test.local.
    env: loadEnv("test", process.cwd(), ""),
    // The data-isolation test talks to the real database, which can be slow.
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
