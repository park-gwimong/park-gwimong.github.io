import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');

  const sortedPosts = posts
    .filter(post => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .slice(0, 10);

  return rss({
    title: "gwimong's blog",
    description: '개발 메모장',
    site: context.site ?? 'https://park-gwimong.github.io',
    items: sortedPosts.map(post => {
      const date = new Date(post.data.pubDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const slugParts = post.slug.split('/');
      const fileSlug = slugParts[slugParts.length - 1];

      return {
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.subtitle || post.data.title,
        categories: [post.data.category, ...post.data.tags],
        link: `/${year}/${month}/${day}/${fileSlug}/`,
      };
    }),
  });
}
