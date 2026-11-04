import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z
        .string()
        .max(
          60,
          'Title should be 60 characters or less for optimal Open Graph display.',
        ),
      description: z
        .string()
        .max(
          155,
          'Description should be 155 characters or less for optimal Open Graph display.',
        ),
      date: z.coerce.date(),
      /** Set when a post is edited after publishing. Feeds dateModified and the sitemap. */
      updated: z.coerce.date().optional(),
      image: image().optional(),
      tags: z.array(z.string()).optional(),
      authors: z.array(z.string()).optional(),
      draft: z.boolean().optional(),
    }),
})

const authors = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    pronouns: z.string().optional(),
    avatar: z.string(),
    bio: z.string().optional(),
    role: z.string().optional(),
    location: z.string().optional(),
    resume: z.url().optional(),
    mail: z.email().optional(),
    website: z.url().optional(),
    kofi: z.url().optional(),
    twitter: z.url().optional(),
    github: z.url().optional(),
    linkedin: z.url().optional(),
    instagram: z.url().optional(),
    discord: z.url().optional(),
    home: z
      .object({
        role: z.string(),
        pronunciation: z.string().optional(),
        eyebrow: z.string(),
        headline: z.string(),
        tagline: z.string(),
        galleryLabel: z.string(),
        galleryUrl: z.url(),
      })
      .optional(),
    about: z
      .object({
        whoLabel: z.string(),
        greeting: z.string(),
        intro: z.string(),
        sceneLabel: z.string(),
        nickname: z.string(),
        bubbles: z.array(z.string()),
        buildLabel: z.string(),
        buildTitle: z.string(),
        buildBody: z.string(),
        highlights: z.array(z.object({ icon: z.string(), title: z.string(), text: z.string() })),
      })
      .optional(),
  }),
})

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    type: z.array(z.string()),
    asset: z.string().optional(),
    fallback: z.string().optional(),
    link: z.url().optional(),
    github: z.url().optional(),
    date: z.string().optional(),
    techStack: z.array(z.string()).optional(),
  }),
})

export const collections = { blog, authors, projects }
