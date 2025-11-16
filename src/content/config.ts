import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    keywords: z.array(z.string()).optional(),
  }),
});

const work = defineCollection({
  type: "content",
  schema: z.object({
    company: z.string(),
    role: z.string(),
    logoUrl: z.string(),
    dateStart: z.coerce.date(),
    dateEnd: z.union([z.coerce.date(), z.string()]),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    lastUpdated: z.coerce.date().optional(),
    draft: z.boolean().optional(),
    liveURL: z.string().optional(),
    repoURL: z.string().optional(),
    imageUrl: z.string().optional(),
    techStack: z.array(z.string()).optional(),
    category: z.string().optional(),
    platforms: z.array(z.string()).optional(),
    price: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }),
});

export const collections = { posts, work, projects };
