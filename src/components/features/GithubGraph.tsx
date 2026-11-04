import * as React from 'react'
import { FaGithub } from 'react-icons/fa'
import { Tooltip } from '@/components/ui/Tooltip'
import { describeDay, levelFor, monthLabels, visibleWeeks, type Contributions, type Week } from '@/lib/github'

interface Props {
  weeks: Week[]
  total: number
  profileUrl: string
}

const CELL = 12
const GAP = 4
const STEP = CELL + GAP
/** Used for the server render and the first client render, before the real width is known. */
const DEFAULT_WEEKS = 26

const LEVEL_CLASS = ['bg-foreground/10', 'bg-foreground/25', 'bg-foreground/45', 'bg-foreground/70', 'bg-foreground/95'] as const

export default function GithubGraph({ weeks: initialWeeks, total: initialTotal, profileUrl }: Props) {
  // Starts with the build-time data, then swaps in fresh data from /api/contributions after mount.
  const [data, setData] = React.useState<Pick<Contributions, 'weeks' | 'total'>>({ weeks: initialWeeks, total: initialTotal })
  const { weeks, total } = data
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const [count, setCount] = React.useState(DEFAULT_WEEKS)
  // False for the server render and until the width is known, so we show a skeleton instead of a graph
  // that is about to change size.
  const [ready, setReady] = React.useState(false)
  const [active, setActive] = React.useState<{ w: number; d: number } | null>(null)

  React.useEffect(() => {
    fetch('/api/contributions')
      .then((res) => (res.ok ? (res.json() as Promise<Contributions>) : null))
      .then((fresh) => {
        if (fresh?.weeks.length) setData({ weeks: fresh.weeks, total: fresh.total })
      })
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => {
      // The wrapper has 4px of padding on each side (see its classes), which is not available to the grid.
      setCount(visibleWeeks(el.clientWidth - 8, CELL, GAP))
      setReady(true)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const shown = React.useMemo(() => weeks.slice(-count), [weeks, count])
  const max = React.useMemo(() => Math.max(0, ...shown.flatMap((w) => w.map((d) => d?.count ?? 0))), [shown])
  const labels = React.useMemo(() => monthLabels(shown), [shown])
  const columns = ready ? shown : weeks
  const gridWidth = columns.length * STEP - GAP

  const onKeyDown = (e: React.KeyboardEvent) => {
    const move = (dw: number, dd: number) => {
      e.preventDefault()
      setActive((a) => {
        let w = a ? a.w + dw : shown.length - 1
        let d = a ? a.d + dd : 0
        w = Math.min(Math.max(w, 0), shown.length - 1)
        d = Math.min(Math.max(d, 0), 6)
        // Skip padding cells that sit outside the data.
        return shown[w]?.[d] ? { w, d } : a ?? { w, d: shown[w]?.findIndex(Boolean) ?? 0 }
      })
    }
    if (e.key === 'ArrowLeft') move(-1, 0)
    else if (e.key === 'ArrowRight') move(1, 0)
    else if (e.key === 'ArrowUp') move(0, -1)
    else if (e.key === 'ArrowDown') move(0, 1)
    else if (e.key === 'Escape') setActive(null)
  }

  if (weeks.length === 0) {
    return (
      <div className="flex h-full flex-col items-start justify-center gap-2 text-sm">
        <p className="font-medium text-foreground">GitHub</p>
        <p className="text-muted-foreground">Contribution data is unavailable right now.</p>
        <a href={profileUrl} target="_blank" rel="noreferrer noopener" className="text-foreground underline underline-offset-4">
          Open my GitHub profile
        </a>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-col gap-1">
        <a href={profileUrl} target="_blank" rel="noreferrer noopener" className="flex items-center gap-2 text-sm text-foreground">
          <FaGithub size={14} className="shrink-0" />
          GitHub
        </a>
        <p className="text-lg font-bold leading-tight text-foreground">
          {total.toLocaleString('en-US')} contributions{' '}
          <span className="text-sm font-normal text-foreground">in the last year</span>
        </p>
      </div>

      <div ref={wrapRef} className="relative -m-1 flex min-w-0 flex-1 items-center justify-end overflow-hidden p-1">
        <div
          {...(ready
            ? { role: 'group', tabIndex: 0, 'aria-label': 'GitHub contribution graph. Use the arrow keys to read each day.' }
            : { 'aria-hidden': true })}
          className="relative shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          style={{ width: gridWidth }}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
          onPointerLeave={() => setActive(null)}
        >
          <div className="relative mb-2 h-4 text-xs text-muted-foreground" aria-hidden="true">
            {(ready ? labels : []).map((l) => (
              <span key={`${l.name}-${l.col}`} className="absolute top-0" style={{ left: l.col * STEP }}>
                {l.name}
              </span>
            ))}
          </div>

          <div className="flex" style={{ gap: GAP }}>
            {columns.map((week, w) => (
              <div key={w} className="flex flex-col" style={{ gap: GAP }}>
                {week.map((day, d) =>
                  !ready ? (
                    <span key={d} className="size-3 animate-pulse rounded-sm bg-foreground/10" aria-hidden="true" />
                  ) : day ? (
                    <Tooltip key={day.date} label={describeDay(day)} open={active?.w === w && active.d === d}>
                      <span
                        role="img"
                        aria-label={describeDay(day)}
                        onPointerEnter={() => setActive({ w, d })}
                        className={`size-3 rounded-sm transition-transform hover:scale-125 ${LEVEL_CLASS[levelFor(day.count, max)]} ${
                          active?.w === w && active.d === d ? 'ring-2 ring-ring' : ''
                        }`}
                      />
                    </Tooltip>
                  ) : (
                    <span key={`pad-${d}`} className="size-3" aria-hidden="true" />
                  ),
                )}
              </div>
            ))}
          </div>

        </div>
      </div>

      <div className="flex h-6 items-center justify-end gap-2 text-xs text-muted-foreground" aria-hidden="true">
        Less
        {LEVEL_CLASS.map((c) => (
          <span key={c} className={`size-3 rounded-sm ${c}`} />
        ))}
        More
      </div>
    </div>
  )
}
