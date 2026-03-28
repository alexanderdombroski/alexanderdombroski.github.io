import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import astro from 'eslint-plugin-astro';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import * as mdx from 'eslint-plugin-mdx';

/**
 * @type {import("eslint").ESLint.Plugin}
 */
const noStaticSvelte = {
  meta: {
    name: 'No Static Svelte',
  },
  rules: {
    'no-static-svelte': {
      meta: {
        type: 'problem',
      },
      create(context) {
        const svelteComponents = new Set();
        const validProperties = new Set(['load', 'idle', 'visible', 'only']);

        return {
          ImportDeclaration(node) {
            if (node.source.value.endsWith('.svelte')) {
              node.specifiers.forEach((specifier) => {
                svelteComponents.add(specifier.local.name);
              });
            }
          },
          JSXOpeningElement(node) {
            const name = node.name.name;
            if (!svelteComponents.has(name)) return;
            const hasClientDirective = node.attributes.some((attr) => {
              return (
                attr.name.namespace?.name === 'client' &&
                validProperties.has(attr.name.name?.name)
              );
            });

            if (!hasClientDirective) {
              context.report({
                node,
                message: `Svelte component "${name}" is missing a client directive`,
              });
            }
          },
        };
      },
    },
  },
};

export default defineConfig([
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/.astro/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.browser },
    plugins: { js },
    extends: ['js/recommended'],
  },
  {
    // Rules for all files
    rules: {
      'no-unused-vars': 'warn',
      'prefer-const': 'warn',
      'no-undef': 'warn',
      quotes: ['warn', 'single', { allowTemplateLiterals: true }],
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
      eqeqeq: 'warn',
      semi: 'warn',
    },
  },
  {
    files: ['**/*.{ts,mts}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2017,
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      eqeqeq: 'warn',
      semi: 'warn',
      '@typescript-eslint/consistent-type-imports': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    ...mdx.flat,
    rules: {
      'no-unused-vars': 'off',
      semi: 'off',
    },
  },
  { ...mdx.flatCodeBlocks },
  ...astro.configs.recommended,
  {
    files: ['**/*.astro', '**/*.mdx'],
    plugins: {
      custom: noStaticSvelte,
    },
    rules: {
      'custom/no-static-svelte': 'warn',
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      globals: globals.browser,
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
      },
    },
    rules: {
      ...svelte.configs.recommended.rules,
    },
  },
]);
