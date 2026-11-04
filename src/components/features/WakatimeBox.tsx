'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import type { IconType } from 'react-icons/lib'
import {
  SiAstro,
  SiC,
  SiCodecrafters,
  SiCplusplus,
  SiCss,
  SiDart,
  SiDocker,
  SiElixir,
  SiFlutter,
  SiGit,
  SiGnubash,
  SiGo,
  SiGraphql,
  SiHaskell,
  SiHtml5,
  SiJavascript,
  SiJson,
  SiKotlin,
  SiLatex,
  SiLua,
  SiMarkdown,
  SiMdx,
  SiOcaml,
  SiPhp,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiR,
  SiRuby,
  SiRust,
  SiScala,
  SiSwift,
  SiTypescript,
  SiVuedotjs,
  SiYaml,
  SiZig,
} from 'react-icons/si'
import { FaJava } from 'react-icons/fa'
import { TbBrandCSharp, TbSql } from 'react-icons/tb'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/Chart'
import { motion } from 'motion/react'
import {
  getCachedData,
  setCachedData,
  CACHE_TTL,
  CACHE_KEYS,
} from '@/lib/cache'

const languageIcons: { [key: string]: IconType } = {
  // Web & Core
  typescript: SiTypescript,
  javascript: SiJavascript,
  astro: SiAstro,
  html: SiHtml5,
  css: SiCss,
  'vue.js': SiVuedotjs,
  vue: SiVuedotjs,

  // Systems & Native
  rust: SiRust,
  go: SiGo,
  golang: SiGo,
  c: SiC,
  'c++': SiCplusplus,
  'c#': TbBrandCSharp as IconType,
  csharp: TbBrandCSharp as IconType,
  'c-sharp': TbBrandCSharp as IconType,
  zig: SiZig,

  // JVM & Mobile
  java: FaJava as IconType,
  kotlin: SiKotlin,
  scala: SiScala,
  dart: SiDart,
  flutter: SiFlutter,
  swift: SiSwift,

  // Scripting & Backend
  python: SiPython,
  ruby: SiRuby,
  php: SiPhp,
  lua: SiLua,
  bash: SiGnubash,
  sh: SiGnubash,
  shell: SiGnubash,
  zsh: SiGnubash,

  // Functional & Scientific
  ocaml: SiOcaml,
  elixir: SiElixir,
  haskell: SiHaskell,
  r: SiR,

  // Data, Query, & Infra
  sql: TbSql as IconType,
  postgresql: SiPostgresql,
  docker: SiDocker,
  dockerfile: SiDocker,
  prisma: SiPrisma,
  graphql: SiGraphql,
  git: SiGit,
  'git config': SiGit,

  // Docs, Markup & Config
  markdown: SiMarkdown,
  mdx: SiMdx,
  json: SiJson,
  yaml: SiYaml,
  tex: SiLatex,
  other: SiCodecrafters,
}

const getLanguageIcon = (language: string): React.JSX.Element | null => {
  const Icon = languageIcons[language]
  return Icon ? <Icon /> : null
}

/** Brand language colors (GitHub Linguist palette). These are third-party identities, not theme tokens. */
const LANGUAGE_COLORS: Record<string, string> = {
  typescript: '#3178c6',
  javascript: '#f1e05a',
  astro: '#ff5a03',
  html: '#e34c26',
  css: '#663399',
  vue: '#41b883',
  'vue.js': '#41b883',
  rust: '#dea584',
  go: '#00add8',
  golang: '#00add8',
  c: '#555555',
  'c++': '#f34b7d',
  'c#': '#178600',
  csharp: '#178600',
  'c-sharp': '#178600',
  zig: '#ec915c',
  java: '#b07219',
  kotlin: '#a97bff',
  scala: '#c22d40',
  dart: '#00b4ab',
  flutter: '#02569b',
  swift: '#f05138',
  python: '#3572a5',
  ruby: '#701516',
  php: '#4f5d95',
  lua: '#000080',
  bash: '#89e051',
  sh: '#89e051',
  shell: '#89e051',
  zsh: '#89e051',
  ocaml: '#3be133',
  elixir: '#6e4a7e',
  haskell: '#5e5086',
  r: '#198ce7',
  sql: '#e38c00',
  postgresql: '#336791',
  docker: '#2496ed',
  dockerfile: '#2496ed',
  prisma: '#2d3748',
  graphql: '#e10098',
  git: '#f05032',
  markdown: '#083fa1',
  yaml: '#cb171e',
  tex: '#3d6117',
}

const getLanguageColor = (language: string): string | undefined =>
  LANGUAGE_COLORS[language.toLowerCase()]

interface Language {
  name: string
  hours: number
  fill: string
}

interface Props {
  omitLanguages?: string[]
}

const colors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
]

const chartConfig: ChartConfig = {
  hours: {
    label: 'Hours',
    color: 'hsl(var(--primary))',
  },
  label: {
    color: 'hsl(var(--primary))',
  },
  ...colors.reduce(
    (acc, color, index) => ({
      ...acc,
      [`language${index}`]: { label: `Language ${index + 1}`, color },
    }),
    {},
  ),
}

const WakatimeBox = ({ omitLanguages = [] }: Props) => {
  const [languages, setLanguages] = useState<Language[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check cache first for faster loading
    const cached = getCachedData<Language[]>(CACHE_KEYS.WAKATIME)
    if (cached) {
      setLanguages(cached)
      setIsLoading(false)
      return
    }

    // Fetch fresh data if cache miss
    fetch(
      'https://hackatime.hackclub.com/api/v1/users/Huruhara/stats?framework=all',
    )
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch data')
        return response.json()
      })
      .then((data) => {
        const filteredLanguages = data.data.languages
          .filter(
            (lang: { name: string }) => !omitLanguages.includes(lang.name),
          )
          .slice(0, 5)
          .map(
            (
              lang: { name: string; total_seconds: number },
              index: number,
            ) => ({
              name: lang.name,
              hours: Number((lang.total_seconds / 3600).toFixed(2)),
              fill: colors[index % colors.length],
            }),
          )

        // Cache the result for faster subsequent loads
        setCachedData(CACHE_KEYS.WAKATIME, filteredLanguages, CACHE_TTL.WAKATIME)
        setLanguages(filteredLanguages)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setIsLoading(false)
      })
  }, [])

  const CustomYAxisTick = ({ x, y, payload }: any) => {
    const icon = getLanguageIcon(payload.value.toLowerCase())
    const color = getLanguageColor(payload.value)
    return (
      <g transform={`translate(${x},${y})`}>
        <title>{payload.value}</title>
        <foreignObject width={22} height={22} x={-28} y={-11}>
          {icon ? (
            React.cloneElement(icon, {
              size: 22,
              color,
              className: 'text-neutral-900 dark:text-white dark:brightness-125',
              'aria-hidden': 'true',
            })
          ) : (
            <text
              x={11}
              y={11}
              className="fill-neutral-900 dark:fill-white font-mono font-bold"
              fontSize="14"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {payload.value.charAt(0).toUpperCase()}
            </text>
          )}
        </foreignObject>
      </g>
    )
  }

  if (isLoading)
    return (
      // Mirrors the real chart: p-4 content box split into five equal bands, a 22px icon slot, and bars
      // at 80% of the band. The spacer on the right keeps room for the value label.
      <div className="size-full p-4">
        <div className="grid h-full grid-rows-5">
          {['100%', '72%', '45%', '30%', '20%'].map((width) => (
            <div key={width} className="flex">
              <div className="flex w-10 shrink-0 items-center pl-1">
                <div className="size-[22px] animate-pulse rounded-full bg-primary/10" />
              </div>
              <div className="flex min-w-0 flex-1 items-center">
                <div className="h-4/5 animate-pulse rounded-md bg-primary/10" style={{ width }} />
              </div>
              {/* Room for the value label that follows each real bar. */}
              <div className="w-[43px] shrink-0" />
            </div>
          ))}
        </div>
      </div>
    )

  if (error) return <div>Error: {error}</div>

  return (
    <motion.div
      className="h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ChartContainer config={chartConfig} className="h-full w-full p-4">
        <BarChart
          accessibilityLayer
          data={languages}
          layout="vertical"
          margin={{ left: -10, right: 35 }}
        >
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            width={50}
            tick={<CustomYAxisTick />}
          />
          <XAxis type="number" hide />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar
            dataKey="hours"
            fill="var(--color-hours)"
            radius={[8, 8, 8, 8]}
            isAnimationActive={true}
          >
            <LabelList
              dataKey="hours"
              position="right"
              formatter={(value: unknown) => `${Math.round(Number(value))}h`}
              className="fill-foreground"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </motion.div>
  )
}

export default WakatimeBox
