import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    math: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  posts: postsCollection,
};
