import globals from "globals";
import pluginJs from "@eslint/js";
import jest from "eslint-plugin-jest";

export default [
  pluginJs.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...Object.keys(globals.node).reduce((acc, key) => {
          acc[key] = "readonly";
          return acc;
        }, {}),
      },
    },
    rules: {
      complexity: ["error", 5],
      "max-lines-per-function": ["error", { max: 25 }],
    },
  },
  {
    files: ["**/*.test.js", "**/*.spec.js"],
    plugins: { jest },
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
      },
    },
    rules: {
      ...jest.configs.recommended.rules,
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "warn",
      "jest/valid-expect": "error",
    },
  },
];
