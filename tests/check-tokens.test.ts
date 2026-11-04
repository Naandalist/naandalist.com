import { describe, it, expect } from 'bun:test'
import { findViolations } from '../scripts/check-tokens'

const rules = (src: string) => findViolations(src).map((v) => v.token)

describe('check-tokens', () => {
  it('accepts allowed tokens', () => {
    const src = `<div class="p-4 px-2 py-3 pt-5 rounded-lg shadow-2 text-sm text-xl gap-1.5 mt-2.5 rounded-full" />`
    expect(findViolations(src)).toEqual([])
  })

  it('flags off-grid padding but not gap or margin', () => {
    expect(rules(`class="p-1.5 px-2.5 py-3.5 gap-1.5 m-2.5"`)).toEqual(['p-1.5', 'px-2.5', 'py-3.5'])
  })

  it('flags arbitrary padding, but allows safe-area and token vars', () => {
    expect(rules(`class="py-[7px] px-[0.3rem]"`)).toEqual(['py-[7px]', 'px-[0.3rem]'])
    expect(rules(`class="pb-[max(1.5rem,env(safe-area-inset-bottom))] px-(--space-card)"`)).toEqual([])
  })

  it('flags removed text classes and arbitrary text sizes', () => {
    expect(rules(`class="text-h1 text-hero text-fluid-lg text-md text-[10px]"`)).toEqual([
      'text-h1',
      'text-hero',
      'text-fluid-lg',
      'text-md',
      'text-[10px]',
    ])
  })

  it('flags removed radius names and bare rounded', () => {
    expect(rules(`class="rounded rounded-2xl rounded-3xl rounded-t-2xl"`)).toEqual([
      'rounded',
      'rounded-2xl',
      'rounded-3xl',
      'rounded-t-2xl',
    ])
  })

  it('flags arbitrary radius but allows inherit', () => {
    expect(rules(`class="rounded-[2px] rounded-t-[10px] rounded-[inherit]"`)).toEqual(['rounded-[2px]', 'rounded-t-[10px]'])
  })

  it('flags removed shadow names and arbitrary shadow', () => {
    expect(rules(`class="shadow shadow-sm shadow-md shadow-lg shadow-xl shadow-2xl shadow-[0_1px_2px_#000]"`)).toEqual([
      'shadow',
      'shadow-sm',
      'shadow-md',
      'shadow-lg',
      'shadow-xl',
      'shadow-2xl',
      'shadow-[0_1px_2px_#000]',
    ])
  })

  it('reports line numbers', () => {
    const v = findViolations(`<a class="p-4">\n<b class="shadow-md"></b>`)
    expect(v[0].line).toBe(2)
  })

  it('ignores variants prefixes when matching', () => {
    expect(rules(`class="md:p-1.5 hover:shadow-lg dark:rounded-2xl"`)).toEqual(['p-1.5', 'shadow-lg', 'rounded-2xl'])
  })
})
