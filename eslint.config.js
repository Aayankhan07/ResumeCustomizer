import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.next', 'node_modules', '.agents', 'coverage']),

  // JS/JSX. The Vite-era reactRefresh preset was removed: it targets Vite's
  // HMR contract, not Next's, so it flagged valid App Router exports.
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^(_|React$)',
          // Unused catch bindings are idiomatic when the error is handled
          // generically; `catch {}` is the modern form but the binding is
          // harmless and rewriting every site invites transcription errors.
          caughtErrors: 'none',
        },
      ],
    },
  },

  // TS/TSX. Previously unlinted entirely — which covered every API route,
  // the middleware, and most of lib/.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Allow deliberate unused args when prefixed with _.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
    },
  },

  // Tests may assert on loosely-typed fixtures.
  {
    files: ['tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Pre-existing debt, demoted to warnings so CI can gate on NEW breakage
  // today rather than waiting on a ~66-error cleanup.
  //
  // These are tracked work, not permanent exemptions:
  //   no-explicit-any        -> plan item 2.5 (JS->TS migration) removes these
  //   set-state-in-effect    -> plan items 3.9 / 4.2 (component split, TanStack Query)
  //   exhaustive-deps        -> same
  // Re-promote each to 'error' as its cleanup item lands.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended],
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/purity': 'warn',
      'no-useless-assignment': 'warn',
    },
  },

  // Must stay last so formatting rules defer to Prettier.
  prettier,
])
