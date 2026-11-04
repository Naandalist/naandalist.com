import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import { lastmodFor } from './src/lib/lastmod'
import tailwindcss from '@tailwindcss/vite'
import vercel from '@astrojs/vercel'
import sectionize from '@hbsnow/rehype-sectionize'
import { transformerCopyButton } from '@rehype-pretty/transformers'
import {
  transformerMetaHighlight,
  transformerNotationDiff,
} from '@shikijs/transformers'
import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'
import icon from 'astro-icon'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkEmoji from 'remark-emoji'
import remarkMath from 'remark-math'
import remarkToc from 'remark-toc'
import { unified } from '@astrojs/markdown-remark'

// Astro dev only puts .env values on import.meta.env. Server code such as the API routes reads
// process.env, so fill it here. Existing variables win, and on Vercel there is no .env file.
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'
for (const [key, value] of Object.entries(loadEnv(mode, process.cwd(), ''))) process.env[key] ??= value


// https://astro.build/config
export default defineConfig({
  site: 'https://naandalist.com',
  output: 'static',
  build: {
    inlineStylesheets: 'always',
  },
  image: {
    remotePatterns: [{ protocol: 'https' }],
  },
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
  integrations: [
    sitemap({
      // /projects/* and /authors redirect to other pages, so they are not pages to index.
      filter: (page) => {
        const { pathname } = new URL(page)
        return !pathname.startsWith('/projects') && pathname !== '/authors/'
      },
      // lastmod comes from git history, so it moves only when the content does.
      serialize(item) {
        const date = lastmodFor(new URL(item.url).pathname)
        if (date) item.lastmod = date.toISOString()
        return item
      },
    }),
    mdx(),
    react(),
    icon(),
  ],
  markdown: {
    syntaxHighlight: false,
    processor: unified({
      rehypePlugins: [
        [
          rehypeExternalLinks,
          {
            target: '_blank',
            rel: ['nofollow', 'noreferrer', 'noopener'],
          },
        ],
        rehypeKatex,
        sectionize,
        [
          rehypePrettyCode,
          {
            theme: {
              light: 'github-light-high-contrast',
              dark: 'github-dark-high-contrast',
            },
            transformers: [
              transformerNotationDiff(),
              transformerMetaHighlight(),
              transformerCopyButton({
                visibility: 'hover',
                feedbackDuration: 1000,
              }),
            ],
          },
        ],
      ],
      remarkPlugins: [remarkToc, remarkMath, remarkEmoji],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    port: 1234,
    host: true,
  },
  devToolbar: {
    enabled: false,
  }
})
