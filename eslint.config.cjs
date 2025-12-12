const eslint = require('@eslint/js');
const globals = require('globals');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');

module.exports = [
  eslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      parser: tsparser,
      parserOptions: {
        project: './jsconfig.json',
        ecmaVersion: 2024
      },
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      'semi': 2,
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-async-promise-executor': 'off',
      'no-empty': 'off',
      'no-unsafe-finally': 'off',
      '@typescript-eslint/no-floating-promises': 'error'
    },
    ignores: ['dist', 'build']
  }
];
