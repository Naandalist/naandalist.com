import { getCollection } from 'astro:content'
import type { APIRoute, GetStaticPaths } from 'astro'
import { SITE } from '@/consts'
import { type OgCard, renderOg } from '@/lib/og'

const longDate = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

/** Cards for the fixed pages. Content pages are added below from their collections. */
const PAGES: Record<string, OgCard> = {
  home: { eyebrow: 'Product engineer', title: 'Listiananda Apriliawan', description: SITE.DESCRIPTION },
  about: { eyebrow: 'About', title: 'Building for web and mobile, end to end', description: 'Who I am, where I have worked, and what I care about when I ship.' },
  blog: { eyebrow: 'Blog', title: 'Notes on shipping software', description: 'Frontend, mobile, React Native, and tooling that holds up in production.' },
  packages: { eyebrow: 'Open source', title: 'Packages', description: 'npm packages for React Native, React, and Node.js.' },
  chat: { eyebrow: 'Chat', title: 'Ask my assistant', description: 'Questions about experience, projects, and packages.' },
  contact: { eyebrow: 'Contact', title: "Let's connect", description: 'Email, socials, and the best way to reach me.' },
}

export const getStaticPaths = (async () => {
  const [posts, projects, packages] = await Promise.all([getCollection('blog'), getCollection('projects'), getCollection('npmjs')])
  const cards: [string, OgCard][] = [
    ...Object.entries(PAGES),
    ...posts
      .filter((p) => !p.data.draft)
      .map((p): [string, OgCard] => [
        `blog/${p.id}`,
        { eyebrow: 'Blog', title: p.data.title, description: p.data.description, meta: [longDate(p.data.date), ...(p.data.tags?.slice(0, 2) ?? [])].join(' · ') },
      ]),
    ...projects
      .filter((p) => p.body?.trim())
      .map((p): [string, OgCard] => [
        `projects/${p.id}`,
        { eyebrow: 'Project', title: p.data.name, description: p.data.description, meta: p.data.category ?? p.data.date },
      ]),
    ...packages.map((p): [string, OgCard] => [
      `npmjs/${p.id}`,
      { eyebrow: 'Package', title: p.data.name, description: p.data.description, meta: `v${p.data.version} · ${p.data.license}` },
    ]),
  ]
  return cards.map(([slug, card]) => ({ params: { slug }, props: { card } }))
}) satisfies GetStaticPaths

export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await renderOg(props.card as OgCard)), { headers: { 'Content-Type': 'image/png' } })
