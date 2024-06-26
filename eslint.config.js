import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

const noUnusedVarsConfig = {
  argsIgnorePattern: "^_",
  varsIgnorePattern: "^_",
  caughtErrorsIgnorePattern: "^_",
};

export default tseslint.config(
  {
    ignores: ["dist/*"],
  },
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigDirName: import.meta.dirname,
      },
    },
  },
  {
    extends: [eslint.configs.recommended],
    ignores: ["webpack/manifest-loader.js"],
  },
  {
    files: ["**/*.ts"],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", noUnusedVarsConfig],
    },
  },
  {
    files: ["*.js"],
    extends: [...tseslint.configs.recommended, ...tseslint.configs.stylistic],
    rules: {
      "no-unused-vars": ["error", noUnusedVarsConfig],
    },
  }
);
