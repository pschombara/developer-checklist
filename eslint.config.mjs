import globals from 'globals'

import jsLint from "@eslint/js"
import tsLint from "typescript-eslint"
import vueLint from "eslint-plugin-vue"
import stylistic from "stylistic/eslint-plugin"


export default [
    {
        files: ["**/*.{js,ts}"],
        languageOptions: {
            parser: "@typescript-eslint/parser",
            parserOptions: {
                sourceType: "module"
            }
        }
    },
    {
        files: ["**/*.vue"],
        languageOptions: {
            parser: "vue-eslint-parser",
            parserOptions: {
                parser: "@typescript-eslint/parser",
                sourceType: "module"
            }
        }
    },
    {
        languageOptions: {
            globals: {...globals.browser, ...globals.node}
        }
    },
    jsLint.configs.recommended,
    ...tsLint.configs.recommended,
    ...vueLint.configs["flat/essential"],
    stylistic.configs["disable-legacy"],
    stylistic.configs.customize({
        indent: 4,
        quotes: "single",
        semi: false,
        commaDangle: "never",
    })
]
