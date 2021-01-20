module.exports =  {
    plugins: [
        "@typescript-eslint",
        "eslint-plugin-tsdoc"
    ],
    extends:  [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        indent: ['error', 4],
        'require-jsdoc': 0, // We are using tsdoc
    },
    parser:  '@typescript-eslint/parser',
    parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        ecmaVersion: 2018,
        sourceType: "module"
    },
    rules: {
        "tsdoc/syntax": "warn"
    },
    env: {
        node: true,
        mocha: true,
    },
};
