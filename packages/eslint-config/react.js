import tseslint from "typescript-eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";
import { version as reactVersion } from "react";

export default tseslint.config(
  // @ts-expect-error
  reactHooks.configs["recommended-latest"],
  // @ts-expect-error
  react.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    name: "monorepo-react-config",
    settings: {
      react: {
        version: reactVersion,
      },
    },

    rules: {
      // This is warn by default, but we want to enforce it
      "react-hooks/exhaustive-deps": "error",

      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-array-index-key": "error",
    },
  },
);
