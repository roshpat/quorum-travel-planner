import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  globalIgnores([
    "dist/**",
    "build/**",
    "node_modules/**",
  ]),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat["recommended-latest"],
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-refresh": reactRefresh },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "react-refresh/only-export-components": ["warn", { "allowConstantExport": true }],
    },
  },
]);

export default eslintConfig;
