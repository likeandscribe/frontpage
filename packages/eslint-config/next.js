import tseslint from "typescript-eslint";
import typescript from "./typescript.js";
import react from "./react.js";
// @ts-ignore no types
import next from "@next/eslint-plugin-next";

export default tseslint.config(
  typescript,
  react,
  next.flatConfig.recommended,
  next.flatConfig.coreWebVitals,
  {
    name: "monorepo-next-config",
    ignores: ["**/.next/**", "**/.vercel/**"],
  },
);

// Bring @typescript-eslint/utils types into scope to solve a non-portable typescript issue caused by pnpm
/**
 * @type {import("@typescript-eslint/utils")}
 */
