import tseslint from "typescript-eslint";
import typescript from "./typescript.js";
import react from "./react.js";
// @ts-ignore no types
import next from "@next/eslint-plugin-next";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
  typescript,
  react,
  next.flatConfig.recommended,
  next.flatConfig.coreWebVitals,
  globalIgnores(
    [".next/", ".vercel/", "node_modules/", "next-env.d.ts"],
    "monorepo-next-config-ignores",
  ),
);

// Bring @typescript-eslint/utils types into scope to solve a non-portable typescript issue caused by pnpm
/**
 * @type {import("@typescript-eslint/utils")}
 */
