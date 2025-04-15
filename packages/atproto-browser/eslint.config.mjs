import { defineConfig } from "@repo/eslint-config/next.js";

export default defineConfig(import.meta.dirname, [
  {
    rules: {
      "no-restricted-imports": ["error", "next/link"],
    },
  },
]);
