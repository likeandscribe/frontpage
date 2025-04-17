import tseslint from "typescript-eslint";
import typescript from "./typescript.js";
import react from "./react.js";
// @ts-ignore no types
import next from "@next/eslint-plugin-next";
import turboRepo from "eslint-config-turbo/flat";

export default tseslint.config(
  typescript,
  react,
  {
    ignores: ["**/.next/**", "**/.vercel/**"],
  },

  next.flatConfig.recommended,
  next.flatConfig.coreWebVitals,

  turboRepo,
);

// Bring @typescript-eslint/utils types into scope to solve a non-portable typescript issue caused by pnpm
/**
 * @type {import("@typescript-eslint/utils")}
 */
