import { describe, expect, it } from 'bun:test'
import { blockBar, humanTime } from '@/components/features/WakatimeBox'

describe('wakatime card', () => {
  it('draws a 25-character block bar like waka-readme', () => {
    expect(blockBar(0)).toBe('░'.repeat(25))
    expect(blockBar(100)).toBe('█'.repeat(25))
    expect(blockBar(89.73)).toHaveLength(25)
    expect(blockBar(89.73).startsWith('█'.repeat(22))).toBe(true)
    expect(blockBar(150)).toBe('█'.repeat(25))
  })

  it('formats time the way WakaTime does', () => {
    expect(humanTime(6 * 3600 + 15 * 60)).toBe('6 hrs 15 mins')
    expect(humanTime(3600 + 60)).toBe('1 hr 1 min')
    expect(humanTime(51 * 60)).toBe('51 mins')
    expect(humanTime(20)).toBe('0 mins')
  })
})
