/**
 * Open Graph cards drawn at build time. satori lays out a small element tree as SVG and sharp turns it into a PNG.
 * Fonts are static TTF copies of the site fonts in src/assets/og, because satori cannot read woff2 or variable fonts.
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import satori from 'satori'
import sharp from 'sharp'

export const OG_WIDTH = 1200
export const OG_HEIGHT = 630
const PAD = 72
/** Text blocks get an explicit width because satori does not wrap flex children on its own. */
const INNER = OG_WIDTH - PAD * 2

export interface OgCard {
  /** Small label above the title, such as "Blog" or "Package". */
  eyebrow: string
  title: string
  /** One line under the title. Cut to fit. */
  description?: string
  /** Shown at the bottom, for example a date or tags. */
  meta?: string
}

const root = process.cwd()
let assets: Promise<{ fonts: Parameters<typeof satori>[1]['fonts']; avatar: string }> | undefined

function loadAssets() {
  assets ??= (async () => {
    const font = (file: string) => readFile(join(root, 'src/assets/og', file))
    const [serif, regular, semibold, avatar] = await Promise.all([
      font('InstrumentSerif-Regular.ttf'),
      font('Geist-Regular.ttf'),
      font('Geist-SemiBold.ttf'),
      readFile(join(root, 'public/static/profile/avatar-ink.png')),
    ])
    return {
      fonts: [
        { name: 'Instrument Serif', data: serif, weight: 400 as const, style: 'normal' as const },
        { name: 'Geist', data: regular, weight: 400 as const, style: 'normal' as const },
        { name: 'Geist', data: semibold, weight: 600 as const, style: 'normal' as const },
      ],
      avatar: `data:image/png;base64,${avatar.toString('base64')}`,
    }
  })()
  return assets
}

type El = { type: string; props: Record<string, unknown> }
const el = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): El => ({
  type,
  props: { style, children, ...extra },
})

function clip(text: string, max: number) {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  // Cut at a word edge so a word is never split in the middle.
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max / 2)).trimEnd()}…`
}

/** Longer titles get a smaller size so they stay inside three lines. */
function titleSize(title: string) {
  if (title.length > 70) return 64
  if (title.length > 44) return 76
  if (title.length > 24) return 92
  return 108
}

export async function renderOg(card: OgCard): Promise<Buffer> {
  const { fonts, avatar } = await loadAssets()
  const ink = '#fafafa'
  const muted = '#a3a3a3'

  const tree = el(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      width: OG_WIDTH,
      height: OG_HEIGHT,
      padding: PAD,
      boxSizing: 'border-box',
      backgroundColor: '#0a0a0a',
      backgroundImage: 'radial-gradient(circle at 85% 0%, #262626 0%, #0a0a0a 55%)',
      color: ink,
      fontFamily: 'Geist',
    },
    [
      el('div', { display: 'flex', fontSize: 28, fontWeight: 600, color: muted, letterSpacing: 4, textTransform: 'uppercase' }, card.eyebrow),
      el('div', { display: 'flex', flexDirection: 'column', gap: 28, width: INNER }, [
        el('div', { display: 'flex', fontFamily: 'Instrument Serif', fontSize: titleSize(card.title), lineHeight: 1.05, color: ink }, clip(card.title, 90)),
        card.description
          ? el('div', { display: 'flex', fontSize: 32, lineHeight: 1.35, color: muted }, clip(card.description, 120))
          : el('div', { display: 'flex' }, ''),
      ]),
      el('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: INNER }, [
        el('div', { display: 'flex', alignItems: 'center', gap: 20 }, [
          el('img', { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fafafa' }, undefined, { src: avatar, width: 64, height: 64 }),
          el('div', { display: 'flex', flexDirection: 'column' }, [
            el('div', { display: 'flex', fontSize: 28, fontWeight: 600 }, 'Listiananda Apriliawan'),
            el('div', { display: 'flex', fontSize: 24, color: muted }, 'naandalist.com'),
          ]),
        ]),
        el('div', { display: 'flex', fontSize: 24, color: muted }, card.meta ? clip(card.meta, 48) : ''),
      ]),
    ],
  )

  const svg = await satori(tree as never, { width: OG_WIDTH, height: OG_HEIGHT, fonts })
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
}
