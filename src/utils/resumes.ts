import { readdirSync } from "node:fs";
import { resolve } from "node:path";

export type ResumeEntry = {
  filename: string;
  pdfUrl: string;
  slug: string;
  title: string;
};

const resumeDirectory = resolve(process.cwd(), "public/resume");

export function getResumeEntries(): ResumeEntry[] {
  return readdirSync(resumeDirectory)
    .filter((filename) => filename.toLowerCase().endsWith(".pdf"))
    .sort((a, b) => a.localeCompare(b))
    .map((filename) => {
      const slug = filename.slice(0, -4);

      return {
        filename,
        pdfUrl: `/resume/${encodeURIComponent(filename)}`,
        slug,
        title: slug.replace(/[-_]+/g, " ").trim(),
      };
    });
}
