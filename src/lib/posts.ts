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

// ---- 시리즈 ------------------------------------------------------------
// 카테고리 폴더 아래에 한 단계 더 폴더가 있으면 그 폴더가 시리즈다.
// 예) devlog/baton/artifact-transformer-1 → 시리즈 "baton"
const SERIES_TITLES: Record<string, string> = {
  baton: 'BATON 작업 일지',
};

export function getSeriesKey(post: Post): string | undefined {
  const parts = post.slug.split('/');
  return parts.length > 2 ? parts[1] : undefined;
}

export function seriesTitle(key: string): string {
  return SERIES_TITLES[key] ?? key;
}

export function seriesUrl(key: string): string {
  return `/series/${key}/`;
}

// 파일명 끝의 번호(artifact-transformer-7, baton-48 → 7, 48). 접두사가 바뀌어도 번호는 이어진다.
function seriesNumber(post: Post): number | undefined {
  const m = post.slug.match(/-(\d+)$/);
  return m ? Number(m[1]) : undefined;
}

/** 시리즈에 속한 공개 글을 순서대로 돌려준다. 글 번호가 있으면 번호순, 없으면 날짜순이다. */
export function getSeriesPosts(posts: Post[], key: string): Post[] {
  return posts
    .filter(p => getSeriesKey(p) === key)
    .sort((a, b) => {
      const na = seriesNumber(a);
      const nb = seriesNumber(b);
      if (na !== undefined && nb !== undefined && na !== nb) return na - nb;
      return a.data.pubDate.valueOf() - b.data.pubDate.valueOf();
    });
}

// ---- 관련 글 -----------------------------------------------------------
/** 겹치는 태그가 많은 순으로 관련 글을 고른다. 같은 시리즈 글은 시리즈 탐색이 있어 제외한다. */
export function getRelated(post: Post, published: Post[], limit = 3): Post[] {
  const key = getSeriesKey(post);
  const tags = new Set(post.data.tags.map(t => slugifyTag(t)));
  return published
    .filter(p => p.id !== post.id && !(key && getSeriesKey(p) === key))
    .map(p => ({
      post: p,
      score:
        p.data.tags.filter(t => tags.has(slugifyTag(t))).length * 2 +
        (p.data.category === post.data.category ? 1 : 0),
    }))
    .filter(x => x.score >= 2)
    .sort((a, b) => b.score - a.score || b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf())
    .slice(0, limit)
    .map(x => x.post);
}
