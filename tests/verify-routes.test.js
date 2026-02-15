import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, test } from "bun:test";

import { verifyRoutes } from "../scripts/verify-routes.mjs";

function createFixtureDist(relativeFiles) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "naandalist-routes-"));

  for (const file of relativeFiles) {
    const absolutePath = path.join(rootDir, file);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, "<html></html>", "utf8");
  }

  return rootDir;
}

describe("verify-routes", () => {
  test("passes for valid route paths", () => {
    const distDir = createFixtureDist([
      "posts/index.html",
      "projects/index.html",
      "id/posts/index.html",
    ]);

    try {
      const result = verifyRoutes(distDir);
      expect(result.fail).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(result.pass).toBe(3);
    } finally {
      fs.rmSync(distDir, { recursive: true, force: true });
    }
  });

  test("fails for malformed indexid path", () => {
    const distDir = createFixtureDist(["id/posts/indexid/index.html"]);

    try {
      const result = verifyRoutes(distDir);
      expect(result.fail).toBeGreaterThan(0);
      expect(result.errors.some((message) => message.includes("indexid"))).toBe(
        true,
      );
    } finally {
      fs.rmSync(distDir, { recursive: true, force: true });
    }
  });

  test("fails for malformed index.id path", () => {
    const distDir = createFixtureDist(["id/posts/index.id/index.html"]);

    try {
      const result = verifyRoutes(distDir);
      expect(result.fail).toBeGreaterThan(0);
      expect(result.errors.some((message) => message.includes("index.id"))).toBe(
        true,
      );
    } finally {
      fs.rmSync(distDir, { recursive: true, force: true });
    }
  });

  test("reports missing dist path as failure", () => {
    const missingDistPath = path.join(
      os.tmpdir(),
      `naandalist-missing-${Date.now()}`,
    );
    const result = verifyRoutes(missingDistPath);

    expect(result.fail).toBeGreaterThan(0);
    expect(result.errors.some((message) => message.includes("dist/ not found"))).toBe(
      true,
    );
  });

  test("CLI exits non-zero when malformed routes exist", () => {
    const distDir = createFixtureDist(["id/posts/indexid/index.html"]);
    const scriptPath = path.resolve(
      process.cwd(),
      "scripts/verify-routes.mjs",
    );

    try {
      const result = spawnSync("node", [scriptPath], {
        env: {
          ...process.env,
          VERIFY_ROUTES_DIST_PATH: distDir,
        },
        encoding: "utf8",
      });

      expect(result.status).toBe(1);
      expect(result.stderr.includes("Route verification failed")).toBe(true);
    } finally {
      fs.rmSync(distDir, { recursive: true, force: true });
    }
  });
});
