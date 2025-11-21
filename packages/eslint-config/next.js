import { defineConfig, globalIgnores } from "eslint/config";
import typescript from "./typescript.js";
import react from "./react.js";
import next from "@next/eslint-plugin-next";

export default defineConfig(
  typescript,
  react,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": next,
    },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
    },
  },
  globalIgnores(
    [".next/", ".vercel/", "node_modules/", "next-env.d.ts"],
    "monorepo-next-config-ignores",
  ),
);

// Bring @typescript-eslint/utils types into scope to solve a non-portable typescript issue caused by pnpm
/**
 * @type {import("@typescript-eslint/utils")}
 */
