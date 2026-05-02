module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  rules: {
    // Add any specific rules or overrides here
    'prettier/prettier': 'error',
  },
};
