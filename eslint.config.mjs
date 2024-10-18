import vue from 'eslint-plugin-vue'
import prettier from 'eslint-plugin-prettier'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
})

export default [...compat.extends('plugin:vue/vue3-recommended', 'prettier'), {
    files: ["**/*.js", "**/*.vue"],
    plugins: {
        vue,
        prettier,
    },

    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.webextensions,
        },

        ecmaVersion: 13,
        sourceType: 'module',
    },

    rules: {
        'no-console': 'warn',
        'no-debugger': 'warn',

        indent: ['error', 4, {
            SwitchCase: 1,
        }],

        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        semi: ['error', 'never'],
        'comma-dangle': ['error', 'always-multiline'],

        'vue/valid-v-slot': ['error', {
            allowModifiers: true,
        }],

        'vue/no-v-for-template-key-on-child': 2,
        'vue/no-v-for-template-key': 0,
    },
}]
