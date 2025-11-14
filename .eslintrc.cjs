module.exports = {
  env: {
    node: true,
    browser: true,
    es2024: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:astro/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  plugins: ["import"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  rules: {
    semi: ["error", "always"],
    quotes: ["error", "double", { allowTemplateLiterals: true }],
    "@typescript-eslint/triple-slash-reference": "off",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-unused-vars": "off", // Turn off base rule as it can report incorrect errors
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: true,
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "import/no-unresolved": [
      "error",
      {
        ignore: [
          "^astro:",
          "^@components/",
          "^@layouts/",
          "^@lib/",
          "^@consts",
          "^@types",
        ],
      },
    ],
    "import/order": [
      "warn",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling", "index"],
        ],
        pathGroups: [
          {
            pattern: "astro",
            group: "external",
            position: "before",
          },
          {
            pattern: "astro:*",
            group: "external",
            position: "before",
          },
          {
            pattern: "@components/**",
            group: "internal",
            position: "after",
          },
          {
            pattern: "@layouts/**",
            group: "internal",
            position: "after",
          },
          {
            pattern: "@lib/**",
            group: "internal",
            position: "after",
          },
          {
            pattern: "@consts",
            group: "internal",
            position: "after",
          },
          {
            pattern: "@types",
            group: "internal",
            position: "after",
          },
        ],
        pathGroupsExcludedImportTypes: ["builtin"],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
  },
  overrides: [
    {
      files: ["*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
      rules: {},
    },
  ],
};
