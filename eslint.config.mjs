import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores([
    "build/**/*",
    "coverage/**/*",
    "docs/**/*",
    "jsdoc/**/*",
    "templates/**/*",
    "tests/bench/**/*",
    "tests/fixtures/**/*",
    "tests/performance/**/*",
    "tmp/**/*",
    "tools/internal-rules/node_modules/**/*",
    "**/test.js",
    "**/.eslintrc.js",
    "types",
    "packages/*/dist",
]), {
    extends: fixupConfigRules(compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react-hooks/recommended",
        "plugin:react/recommended",
    )),

    plugins: {
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
    },

    languageOptions: {
        parser: tsParser,
    },

    settings: {
        react: {
            version: "detect",
        },
    },

    rules: {
        "react-hooks/rules-of-hooks": "off",
        "react/react-in-jsx-scope": "off",
        "react/display-name": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-unsafe-declaration-merging": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unnecessary-type-constraint": "off",
        "@typescript-eslint/no-empty-object-type": "off",

        quotes: ["error", "single", {
            allowTemplateLiterals: true,
        }],

        semi: ["error", "never"],
        "react/prop-types": "off",
        "eol-last": ["error", "always"],
        eqeqeq: ["error"],

        "@typescript-eslint/no-this-alias": ["error", {
            allowDestructuring: true,
            allowedNames: ["self", "node"],
        }],

        "@typescript-eslint/no-empty-function": ["error", {
            allow: [
                "private-constructors",
                "protected-constructors",
                "methods",
                "asyncMethods",
                "arrowFunctions",
            ],
        }],

        "@typescript-eslint/no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
        }],
    },
}]);