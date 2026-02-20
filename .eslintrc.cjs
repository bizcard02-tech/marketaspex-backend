module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'airbnb-base',
        'plugin:node/recommended',
    ],
    overrides: [
        {
            env: {
                node: true,
            },
            files: [
                '.eslintrc.{js,cjs}',
            ],
            parserOptions: {
                sourceType: 'script',
            },
        },
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        indent: 0, // allow any indentation style
        // quotes: ['error', 'double', { allowTemplateLiterals: true }], // must use double quotes and allow template literals
        'spaced-comment': ['error', 'always'], // must have space after //
        'linebreak-style': 0, // allow windows and unix linebreaks
        'class-methods-use-this': 0, // allow class methods to not use this
        'import/extensions': ['error', 'always', { js: 'always' }], // must have .js extension while importing
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }], // allow ++ in for loop
        'object-curly-newline': 0, // must have consistent object curly newlines
        'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
        'require-await': 'error', // if function is async but doest use await inside  then show error,
        'node/no-sync': ['error', { allowAtRootLevel: false }], // don't use any synchronous file read method
        'max-classes-per-file': ['error', 5], // allow to write 5 classess in a file by default 1
        'max-len': 0,
        'node/no-unpublished-import': 0,
        'lines-between-class-members': 0, // allow to write multiple lines between class members
        'no-process-exit': 0, // must use process.exit() instead of exit()
        'no-underscore-dangle': 0,
        'no-unused-vars': 0,
        'node/no-unsupported-features/es-syntax': 0,
        'no-useless-escape': 0,
        // plugin rules
        'node/exports-style': ['error', 'module.exports'],
        'node/file-extension-in-import': ['error', 'always'],
        'node/prefer-global/buffer': ['error', 'always'],
        'node/prefer-global/console': ['error', 'always'],
        'node/prefer-global/process': ['error', 'always'],
        'node/prefer-global/url-search-params': ['error', 'always'],
        'node/prefer-global/url': ['error', 'always'],
        'node/prefer-promises/dns': 'error',
        'node/prefer-promises/fs': 'error',
        'node/no-deprecated-api': 'error',
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
};
