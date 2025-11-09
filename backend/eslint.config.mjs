import js from '@eslint/js';
import google from 'eslint-config-google';
import globals from 'globals';

export default [
  js.configs.recommended,
  google,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'valid-jsdoc': 'off',
      'require-jsdoc': 'off',
      'no-console': 'off',
      'max-len': 'off',
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'module',
    },
  },
];
