// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  site: 'https://alexdombroski.com',
  integrations: [mdx(), sitemap(), svelte()],
  devToolbar: {
    enabled: false,
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Source Sans 3',
      cssVariable: '--heading-font',
    },
    {
      provider: fontProviders.google(),
      name: 'Atkinson Hyperlegible',
      cssVariable: '--paragraph-font',
    },
    {
      provider: fontProviders.google(),
      name: 'Datatype',
      cssVariable: '--logo-font',
      fallbacks: ['Cambria'],
    },
  ],
});
