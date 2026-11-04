import { describe, it, expect } from 'bun:test'

const read = (p: string) => Bun.file(p).text()

describe('chat entry points', () => {
  it('has no floating chat button any more', async () => {
    expect(await read('src/layouts/Layout.astro')).not.toContain('FloatingChatButton')
    expect(await Bun.file('src/components/chat/FloatingChatButton.tsx').exists()).toBe(false)
  })

  it('keeps chat reachable from the profile card back and from the nav', async () => {
    expect(await read('src/components/profile/ProfileFlipCard.tsx')).toContain('href="/chat"')
    expect(await read('src/consts.ts')).toContain('/chat')
  })
})
