import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactCompiler from "eslint-plugin-react-compiler";
// @ts-ignore no types
import next from "@next/eslint-plugin-next";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";
import { version as reactVersion } from "react";

/**
 * @param {string} baseDirectory
 * @param {import("typescript-eslint").InfiniteDepthConfigWithExtends[]} configs
 */
export function defineConfig(baseDirectory, configs = []) {
  return tseslint.config(
    {
      ignores: ["**/.next/**", "**/.vercel/**"],
    },
    next.flatConfig.recommended,
    next.flatConfig.coreWebVitals,

    eslint.configs.recommended,
    tseslint.configs.recommended,
    reactCompiler.configs.recommended,
    reactHooks.configs["recommended-latest"],
    // @ts-expect-error
    react.configs.flat.recommended,
    jsxA11y.flatConfigs.recommended,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: baseDirectory,
        },
      },

      settings: {
        react: {
          version: reactVersion,
        },
      },

      rules: {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "react/no-array-index-key": "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-misused-promises": "error",
        "@typescript-eslint/consistent-type-imports": [
          "error",
          {
            fixStyle: "inline-type-imports",
            prefer: "type-imports",
          },
        ],
        "@typescript-eslint/consistent-type-exports": [
          "error",
          { fixMixedExportsWithInlineTypeSpecifier: true },
        ],
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
    ...configs,
  );
}

// Bring @typescript-eslint/utils types into scope to solve a non-portable typescript issue caused by pnpm
/**
 * @type {import("@typescript-eslint/utils")}
 */
