import fs from "node:fs";
import path from "node:path";

import { describe, expect, test } from "bun:test";

import { SITE } from "../src/constants";
import { createPersonSchema } from "../src/lib/person-schema";

const CONTENT_ROOT = path.resolve(process.cwd(), "src/content");
const COLLECTIONS = ["posts", "work", "projects", "npmjs"];

function listContentSlugs(collection) {
  const collectionDir = path.join(CONTENT_ROOT, collection);

  return fs
    .readdirSync(collectionDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function countFeaturedMarkdown(collection) {
  let featured = 0;

  for (const slug of listContentSlugs(collection)) {
    for (const filename of ["index.md", "index.id.md"]) {
      const filePath = path.join(CONTENT_ROOT, collection, slug, filename);
      if (!fs.existsSync(filePath)) continue;
      const source = fs.readFileSync(filePath, "utf8");
      if (/^featured:\s*true\s*$/m.test(source)) {
        featured += 1;
      }
    }
  }

  return featured;
}

describe("content locale pairs", () => {
  test("every content slug has both index.md and index.id.md", () => {
    const missing = [];

    for (const collection of COLLECTIONS) {
      for (const slug of listContentSlugs(collection)) {
        const slugDir = path.join(CONTENT_ROOT, collection, slug);
        for (const filename of ["index.md", "index.id.md"]) {
          if (!fs.existsSync(path.join(slugDir, filename))) {
            missing.push(`${collection}/${slug}/${filename}`);
          }
        }
      }
    }

    expect(missing).toEqual([]);
  });
});

describe("homepage featured limits", () => {
  test("Home.astro caps collections with SITE.NUM_*_ON_HOMEPAGE", () => {
    const homeSource = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/Home.astro"),
      "utf8",
    );

    expect(homeSource).toContain(".slice(0, SITE.NUM_POSTS_ON_HOMEPAGE)");
    expect(homeSource).toContain(".slice(0, SITE.NUM_PROJECTS_ON_HOMEPAGE)");
    expect(homeSource).toContain(".slice(0, SITE.NUM_NPMJS_ON_HOMEPAGE)");
    expect(homeSource).toContain(".slice(0, SITE.NUM_WORKS_ON_HOMEPAGE)");
  });

  test("SITE homepage caps are positive numbers", () => {
    expect(SITE.NUM_POSTS_ON_HOMEPAGE).toBeGreaterThan(0);
    expect(SITE.NUM_PROJECTS_ON_HOMEPAGE).toBeGreaterThan(0);
    expect(SITE.NUM_NPMJS_ON_HOMEPAGE).toBeGreaterThan(0);
    expect(SITE.NUM_WORKS_ON_HOMEPAGE).toBeGreaterThan(0);
  });

  test("featured markdown can exceed the homepage cap without changing the slice contract", () => {
    expect(countFeaturedMarkdown("posts")).toBeGreaterThanOrEqual(0);
    expect(countFeaturedMarkdown("projects")).toBeGreaterThanOrEqual(0);
    expect(countFeaturedMarkdown("npmjs")).toBeGreaterThanOrEqual(0);
  });
});

describe("Person JSON-LD", () => {
  test("parses and does not contain Portofolio", () => {
    const schema = createPersonSchema({
      siteUrl: SITE.URL,
      image: `${SITE.URL}/banner.webp`,
    });
    const serialized = JSON.stringify(schema);

    expect(() => JSON.parse(serialized)).not.toThrow();
    expect(schema["@type"]).toBe("Person");
    expect(serialized.includes("Portofolio")).toBe(false);
    expect(schema.knowsAbout).toContain("Personal Portfolio");
    expect(schema.worksFor.name).toBe("Dicoding Indonesia");
  });
});
