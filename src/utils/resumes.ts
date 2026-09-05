import { readdirSync } from "node:fs";
import { resolve } from "node:path";

export type ResumeEntry = {
  filename: string;
  pdfUrl: string;
  href: string;
  slug: string;
  title: string;
  role: string;
};

const resumeDirectory = resolve(process.cwd(), "public/resume");
const namePrefix = "Listiananda-Apriliawan-";

function toLabel(value: string) {
  return value.replace(/[-_]+/g, " ").trim();
}

export function getResumeEntries(): ResumeEntry[] {
  return readdirSync(resumeDirectory)
    .filter((filename) => filename.toLowerCase().endsWith(".pdf"))
    .sort((a, b) => a.localeCompare(b))
    .map((filename) => {
      const slug = filename.slice(0, -4);
      const role = slug.startsWith(namePrefix)
        ? toLabel(slug.slice(namePrefix.length))
        : toLabel(slug);

      return {
        filename,
        pdfUrl: `/resume/${encodeURIComponent(filename)}`,
        href: `/resume/${encodeURIComponent(slug)}`,
        slug,
        title: "Listiananda Apriliawan",
        role: role || "Resume",
      };
    });
}
