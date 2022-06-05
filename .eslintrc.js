module.exports = {
    root: true,
    env: {
        node: true,
        webextensions: true,
    },
    extends: [
        'plugin:vue/essential',
        'eslint:recommended',
    ],
    parserOptions: {
        parser: 'babel-eslint',
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

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
