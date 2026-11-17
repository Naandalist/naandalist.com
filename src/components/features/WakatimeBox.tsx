"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { SiWakatime } from "react-icons/si";
import {
  getCachedData,
  setCachedData,
  CACHE_TTL,
  CACHE_KEYS,
} from "@/lib/cache";

/**
 * All-time coding activity from Wakatime, laid out like the waka-readme block on my
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

const WAKATIME_API_URL = import.meta.env.PUBLIC_WAKATIME_API_URL;

// Earliest date the stats endpoint should count from. Hackatime defaults to 10 years back, so pass an explicit start.
const ALL_TIME_START = "1970-01-01";

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

    fetch(`${WAKATIME_API_URL}/stats?start_date=${ALL_TIME_START}`)
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
  }, [omitLanguages]);

  const header = (total: string) => (
    <div className="flex flex-col gap-1">
      <a
        href="https://wakatime.com"
        target="_blank"
        rel="noreferrer noopener"
        className="flex items-center gap-2 text-sm text-foreground"
      >
        <SiWakatime size={14} className="shrink-0" />
        WakaTime
      </a>
      <p className="text-lg font-bold leading-tight text-foreground">
        {total}{" "}
        <span className="text-sm font-normal">of coding, all time</span>
      </p>
      <p className="text-sm text-muted-foreground">
        Recorded automatically by WakaTime while I write code.
      </p>
    </div>
  );

  const wrap = "flex size-full flex-col gap-4";

  if (isLoading)
    return (
      <div className={wrap}>
        {header("…")}
        <ul className="flex flex-col gap-2">
          {(["sk-0", "sk-1", "sk-2", "sk-3", "sk-4"] as const).map((id, i) => (
            <li
              key={id}
              className={i < ROWS - 1 ? "block" : "hidden sm:block"}
            >
              <div
                className="h-4 animate-pulse rounded-full bg-foreground/10"
                style={{ width: `${90 - i * 12}%` }}
              />
            </li>
          ))}
        </ul>
      </div>
    );

  if (error || !stats)
    return (
      <div className={wrap}>
        {header("—")}
        <p className="text-sm text-muted-foreground">
          Couldn't reach WakaTime. Check back later.
        </p>
      </div>
    );

  return (
    <motion.div
      className={wrap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {header(humanTime(stats.totalSeconds))}
      {stats.languages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No coding activity yet.</p>
      ) : (
        <ul className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 text-xs">
          {stats.languages.map((lang, i) => (
            // The phone card is shorter, so it shows one row fewer.
            <li
              key={lang.name}
              className={i < ROWS - 1 ? "contents" : "hidden sm:contents"}
            >
              <span className="truncate text-foreground">{lang.name}</span>
              <span
                aria-hidden="true"
                className="h-3 overflow-hidden rounded-full bg-foreground/10"
              >
                <span
                  className="block h-full rounded-full bg-foreground"
                  style={{ width: `${Math.min(Math.max(lang.percent, 0), 100)}%` }}
                />
              </span>
              <span className="text-right tabular-nums text-muted-foreground">
                {humanTime(lang.seconds)} · {lang.percent.toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default WakatimeBox;
