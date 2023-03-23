module.exports = {
    root: true,
    env: {
        es2021: true,
        node: true,
        webextensions: true,
    },
    extends: [
        'plugin:vue/vue3-recommended',
        'prettier',
    ],
    parserOptions: {
        ecmaVersion: 13,
        sourceType: 'module',
    },
    plugins: ['vue', 'prettier'],
    rules: {
        'no-console': 'warn',
        'no-debugger': 'warn',

        // enable additional rules
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'never'],
        'comma-dangle': ['error', 'always-multiline'],
        'vue/valid-v-slot': ['error', {
            allowModifiers: true,
        }],
        'vue/no-v-for-template-key-on-child': 2,
        'vue/no-v-for-template-key': 0,
    },
}
