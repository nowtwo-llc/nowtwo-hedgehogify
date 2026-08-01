import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
    {
        ignores: ['build/', 'dist/', 'node_modules/', 'eslint-report.html']
    },

    js.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,

    {
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname
            },
            globals: globals.browser
        },
        rules: {
            '@typescript-eslint/ban-ts-comment': 'warn',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/restrict-plus-operands': 'error',
            'max-classes-per-file': ['error', 12],
            'no-param-reassign': 'warn',
            'no-underscore-dangle': 'off',
            'no-restricted-globals': 'warn'
        }
    },

    // Build/config scripts are plain CJS and are not covered by tsconfig.json,
    // so type-aware rules cannot run against them.
    {
        files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
        extends: [tseslint.configs.disableTypeChecked],
        languageOptions: {
            globals: { ...globals.node }
        },
        rules: {
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-require-imports': 'off'
        }
    },

    {
        files: ['example/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
                // Consumed from the UMD bundle loaded by example/index.html
                HedgeHogify: 'readonly'
            }
        }
    },

    {
        files: ['tests/**/*.ts'],
        languageOptions: {
            globals: globals.browser
        },
        rules: {
            // chai-style assertions are property accesses, e.g. `expect(x).to.not.be.null`
            '@typescript-eslint/no-unused-expressions': 'off'
        }
    },

    prettierRecommended,
    {
        rules: {
            'prettier/prettier': 'warn'
        }
    }
);
