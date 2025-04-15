import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { FlatCompat } from "@eslint/eslintrc";
import reactCompiler from "eslint-plugin-react-compiler";
// @ts-ignore no types
import next from "@next/eslint-plugin-next";
import jsxA11y from "eslint-plugin-jsx-a11y";

/**
 * @param {string} baseDirectory
 */
export function defineConfig(baseDirectory) {
  const compat = new FlatCompat({ baseDirectory });

  return tseslint.config(
    {
      ignores: ["**/.next/**", "**/.vercel/**"],
    },
    next.flatConfig.recommended,
    next.flatConfig.coreWebVitals,

    eslint.configs.recommended,
    tseslint.configs.recommended,
    reactCompiler.configs.recommended,
    jsxA11y.flatConfigs.recommended,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: baseDirectory,
        },
      },

      rules: {
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-misused-promises": "error",
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            args: "all",
            argsIgnorePattern: "^_",
            caughtErrors: "all",
            caughtErrorsIgnorePattern: "^_",
            destructuredArrayIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            ignoreRestSiblings: true,
          },
        ],
      },
    },
  );
}

// Bring @typescript-eslint/utils types into scope to solve a non-portable typescript issue caused by pnpm
/**
 * @type {import("@typescript-eslint/utils")}
 */
