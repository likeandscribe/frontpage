import tseslint from "typescript-eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";
import { version as reactVersion } from "react";
import reactCompiler from "eslint-plugin-react-compiler";

export default tseslint.config(
  reactCompiler.configs.recommended,
  reactHooks.configs["recommended-latest"],
  // @ts-expect-error
  react.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    settings: {
      react: {
        version: reactVersion,
      },
    },

    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-array-index-key": "error",
    },
  },
);
