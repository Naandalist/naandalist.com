import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export function readingTime(html: string) {
  const textOnly = html.replace(/<[^>]+>/g, "");
  const wordCount = textOnly.split(/\s+/).length;
  const readingTimeMinutes = (wordCount / 200 + 1).toFixed();
  return `${readingTimeMinutes} min read`;
}

export function normalizeSlug(id: string): string {
  return id
    .replace(/\.(md|mdx)$/, "")
    .replace(/\/index(\.id)?$/, "");
}

const featuredProjectOrder = [
  "web-ringkaskata",
  "mobile-app-airpaz",
  "ebenefits-aia-customer-apps",
];

const trailingProjectOrder = ["mobile-app-info-haji", "mobile-app-kbbi-vi"];

type ProjectSortEntry = {
  id: string;
  data: {
    date: Date;
  };
};

export function compareProjectsByFeaturedOrder(
  a: ProjectSortEntry,
  b: ProjectSortEntry,
) {
  const aSlug = normalizeSlug(a.id);
  const bSlug = normalizeSlug(b.id);
  const aPriority = featuredProjectOrder.indexOf(aSlug);
  const bPriority = featuredProjectOrder.indexOf(bSlug);
  const normalizedAPriority =
    aPriority === -1 ? Number.POSITIVE_INFINITY : aPriority;
  const normalizedBPriority =
    bPriority === -1 ? Number.POSITIVE_INFINITY : bPriority;
  const priorityDiff = normalizedAPriority - normalizedBPriority;

  if (priorityDiff) return priorityDiff;

  const aTrailingPriority = trailingProjectOrder.indexOf(aSlug);
  const bTrailingPriority = trailingProjectOrder.indexOf(bSlug);
  const aIsTrailing = aTrailingPriority !== -1;
  const bIsTrailing = bTrailingPriority !== -1;

  if (aIsTrailing && bIsTrailing) {
    return aTrailingPriority - bTrailingPriority;
  }
  if (aIsTrailing) return 1;
  if (bIsTrailing) return -1;

  return b.data.date.valueOf() - a.data.date.valueOf();
}

export function dateRange(startDate: Date, endDate?: Date | string): string {
  const startMonth = startDate.toLocaleString("default", { month: "short" });
  const startYear = startDate.getFullYear().toString();
  let endMonth;
  let endYear;

  if (endDate) {
    if (typeof endDate === "string") {
      endMonth = "";
      endYear = endDate;
    } else {
      endMonth = endDate.toLocaleString("default", { month: "short" });
      endYear = endDate.getFullYear().toString();
    }
  }

  return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
}
