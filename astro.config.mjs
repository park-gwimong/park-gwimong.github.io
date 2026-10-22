import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkCjkEmphasis from './plugins/remark-cjk-emphasis.mjs';

export default defineConfig({
  site: 'https://park-gwimong.github.io',
  trailingSlash: 'always',

  integrations: [sitemap()],

  markdown: {
    remarkPlugins: [remarkCjkEmphasis],
    syntaxHighlight: 'shiki',
    shikiConfig: {
      // 라이트/다크 테마를 함께 출력하고, 다크 모드에서는 CSS 변수로 전환한다
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: false,
    },
  },

  build: {
    format: 'directory',
  },
});
