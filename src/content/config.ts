import { defineCollection } from "astro:content";

import { z } from "astro/zod";

// TODO(#15): migrate off legacy.collectionsBackwardsCompat
// 1. Move this file to src/content.config.ts
// 2. Replace type: "content" with glob loaders
// 3. Audit entry.id / normalizeSlug assumptions
// 4. Remove astro.config.mjs legacy.collectionsBackwardsCompat after verify:routes passes

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    featured: z.boolean().optional().default(false),
    keywords: z.array(z.string()).optional(),
    lang: z.enum(["en", "id"]).optional().default("en"),
  }),
});

const work = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      company: z.string(),
      role: z.string(),
      logoUrl: image(),
      dateStart: z.coerce.date(),
      dateEnd: z.union([z.coerce.date(), z.string()]),
      featured: z.boolean().optional().default(false),
      lang: z.enum(["en", "id"]).optional().default("en"),
    }),
});

const projects = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      lastUpdated: z.coerce.date().optional(),
      draft: z.boolean().optional(),
      featured: z.boolean().optional().default(false),
      liveURL: z.string().optional(),
      repoURL: z.string().optional(),
      imageUrl: image().optional(),
      techStack: z.array(z.string()).optional(),
      category: z.string().optional(),
      platforms: z.array(z.string()).optional(),
      price: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      lang: z.enum(["en", "id"]).optional().default("en"),
    }),
});

const npmjs = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    lastUpdated: z.coerce.date().optional(),
    draft: z.boolean().optional(),
    featured: z.boolean().optional().default(false),
    npmURL: z.string().optional(),
    repoURL: z.string().optional(),
    version: z.string().optional(),
    license: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    lang: z.enum(["en", "id"]).optional().default("en"),
  }),
});

export const collections = { posts, work, projects, npmjs };
