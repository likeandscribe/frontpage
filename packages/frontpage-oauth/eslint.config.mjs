import base from "@repo/eslint-config/typescript.js";
export default [
  ...base,
  {
    ignores: ["eslint.config.mjs"],
  },
];
