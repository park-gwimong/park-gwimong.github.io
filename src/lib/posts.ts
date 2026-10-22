import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export async function getPublishedPosts(): Promise<Post[]> {
  return (await getCollection('posts'))
    .filter(post => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function getPostUrl(post: Post): string {
  const date = new Date(post.data.pubDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const fileSlug = post.slug.split('/').pop();
  return `/${year}/${month}/${day}/${fileSlug}/`;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function slugifyTag(tag: string): string {
  return tag.toLowerCase()
    .replace(/\//g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9가-힣-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function categoryUrl(category: string): string {
  return `/category/${category.toLowerCase()}/`;
}

// 한글은 분당 약 500자, 영문·코드는 분당 약 220단어로 잡는다.
export function readingMinutes(body: string): number {
  const text = body
    .replace(/^---[\s\S]*?---/, '')
    .replace(/```[\s\S]*?```/g, m => m.split('\n').slice(0, 15).join('\n'));
  const korean = (text.match(/[가-힣]/g) ?? []).length;
  const words = text.replace(/[가-힣]/g, ' ').split(/\s+/).filter(w => /[a-zA-Z0-9]/.test(w)).length;
  return Math.max(1, Math.round(korean / 500 + words / 220));
}
