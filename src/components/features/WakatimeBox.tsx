"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  getCachedData,
  setCachedData,
  CACHE_TTL,
  CACHE_KEYS,
} from "@/lib/cache";

/**
 * Coding activity for the last 7 days from Wakatime, laid out like the waka-readme block on my
 * GitHub profile: language, time, a 25-character block bar, and percent.
 */

interface Language {
  name: string;
  seconds: number;
  percent: number;
}

interface Stats {
  totalSeconds: number;
  languages: Language[];
}

interface Props {
  omitLanguages?: string[];
}

const ROWS = 5;
const BAR_LENGTH = 25;
const BLOCKS = ["░", "▒", "▓", "█"];

/** Same shape as waka-readme: full blocks, one partial block for the remainder, light shade after. */
export function blockBar(percent: number, length = BAR_LENGTH): string {
  const filled = (Math.min(Math.max(percent, 0), 100) / 100) * length;
  const full = Math.floor(filled);
  if (full >= length) return BLOCKS[3].repeat(length);
  const partial = BLOCKS[Math.round((filled - full) * (BLOCKS.length - 1))];
  return BLOCKS[3].repeat(full) + partial + BLOCKS[0].repeat(length - full - 1);
}

/** "5 hrs 36 mins", "51 mins", "0 mins", like WakaTime. */
export function humanTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const h = hrs > 0 ? `${hrs} hr${hrs === 1 ? "" : "s"} ` : "";
  return `${h}${mins} min${mins === 1 ? "" : "s"}`;
}

const percentText = (p: number) => `${p.toFixed(2).padStart(5, "0")} %`;

const sevenDaysAgo = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 7);
  return d.toISOString().slice(0, 10);
};

const WAKATIME_API_URL = import.meta.env.PUBLIC_WAKATIME_API_URL;

const WakatimeBox = ({ omitLanguages = [] }: Props) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cached = getCachedData<Stats>(CACHE_KEYS.WAKATIME);
    if (cached) {
      setStats(cached);
      setIsLoading(false);
      return;
    }

    fetch(`${WAKATIME_API_URL}/stats?start_date=${sevenDaysAgo()}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch data");
        return response.json();
      })
      .then((data) => {
        const next: Stats = {
          totalSeconds: data.data.total_seconds ?? 0,
          languages: (data.data.languages ?? [])
            .filter(
              (lang: { name: string }) => !omitLanguages.includes(lang.name),
            )
            .slice(0, ROWS)
            .map(
              (lang: {
                name: string;
                total_seconds: number;
                percent: number;
              }) => ({
                name: lang.name,
                seconds: lang.total_seconds,
                percent: lang.percent,
              }),
            ),
        };
        setCachedData(CACHE_KEYS.WAKATIME, next, CACHE_TTL.WAKATIME);
        setStats(next);
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const header = (total: string) => (
    <div className="flex flex-col">
      <span className="text-muted-foreground">Last 7 Days</span>
      <span>
        Total Time:{" "}
        <span className="font-semibold text-foreground">{total}</span>
      </span>
    </div>
  );

  if (isLoading)
    return (
      <div className="flex size-full flex-col gap-3 p-2 font-mono text-xs leading-5">
        {header("…")}
        <ul className="flex flex-col">
          {Array.from({ length: ROWS }, (_, i) => (
            <li
              key={i}
              className={`h-5 items-center ${i < ROWS - 1 ? "flex" : "hidden sm:flex"}`}
            >
              <div
                className="h-3 animate-pulse rounded-sm bg-primary/10"
                style={{ width: `${90 - i * 12}%` }}
              />
            </li>
          ))}
        </ul>
      </div>
    );

  if (error || !stats)
    return (
      <div className="flex size-full flex-col gap-3 p-2 font-mono text-xs leading-5">
        {header("—")}
        <p className="whitespace-normal text-muted-foreground">
          Couldn't reach Wakatime. Check back later.
        </p>
      </div>
    );

  return (
    <motion.div
      className="flex size-full flex-col gap-3 p-2 font-mono text-xs leading-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {header(humanTime(stats.totalSeconds))}
      {stats.languages.length === 0 ? (
        <p className="text-muted-foreground">No coding activity this week.</p>
      ) : (
        <ul className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-x-4 sm:grid-cols-[auto_auto_auto_auto] sm:justify-start">
          {stats.languages.map((lang, i) => (
            // The phone card is shorter, so it shows one row fewer.
            <li
              key={lang.name}
              className={i < ROWS - 1 ? "contents" : "hidden sm:contents"}
            >
              <span className="truncate text-foreground">{lang.name}</span>
              <span className="text-muted-foreground">
                {humanTime(lang.seconds)}
              </span>
              <span
                aria-hidden="true"
                className="hidden text-foreground/70 sm:inline"
              >
                {blockBar(lang.percent)}
              </span>
              <span className="text-right tabular-nums text-muted-foreground">
                {percentText(lang.percent)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default WakatimeBox;
