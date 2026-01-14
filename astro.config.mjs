import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://park-gwimong.github.io',
  trailingSlash: 'always',

  integrations: [],

  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark',
    },
  },

  build: {
    format: 'directory',
  },
});
