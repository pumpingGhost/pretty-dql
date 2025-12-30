import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from 'typescript-eslint';
import globals from "globals";
import pluginJest from 'eslint-plugin-jest';

export default [
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
        parser: tseslint.parser,
        globals: {
            ...globals.node,
            ...globals.jest,
        }
    },
    plugins: {
        jest: pluginJest,
    },
    rules: {
        'prettier/prettier': 'error',
        'no-console': 'off',
        eqeqeq: 'error',
        curly: ['error', 'all'],
        '@typescript-eslint/no-unused-vars': [
            'warn',
            { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
    },
  },
  {
      ignores: ['dist/**', 'node_modules/**'],
  }
];
