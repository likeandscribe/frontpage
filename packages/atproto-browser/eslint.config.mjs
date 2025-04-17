import base from "@repo/eslint-config/next.js";
export default [
  ...base,
  {
    rules: {
      "no-restricted-imports": ["error", "next/link"],
    },
  },
];
