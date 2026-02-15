import fs from "node:fs";
import path from "node:path";

const SITE_URL = "https://naandalist.com";
const DIST_DIR = path.resolve(process.cwd(), "dist");

const result = {
  checks: 0,
  errors: [],
};

function check(condition, message) {
  result.checks += 1;
  if (!condition) {
    result.errors.push(message);
  }
}

function readDistFile(relativePath) {
  const filePath = path.join(DIST_DIR, relativePath);
  return fs.readFileSync(filePath, "utf8");
}

function listHtmlFiles(dirPath) {
  const files = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listHtmlFiles(absolutePath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(absolutePath);
    }
  }

  return files;
}

function resolveDistPathFromHref(href) {
  try {
    const url = new URL(href, SITE_URL);
    const pathname = url.pathname;
    const relativePath = pathname.replace(/^\/+/, "");

    if (pathname.endsWith("/")) {
      return path.join(DIST_DIR, relativePath, "index.html");
    }

    if (path.extname(pathname)) {
      return path.join(DIST_DIR, relativePath);
    }

    return path.join(DIST_DIR, relativePath, "index.html");
  } catch {
    return null;
  }
}

function normalizeFilePath(filePath) {
  return filePath.replace(`${DIST_DIR}${path.sep}`, "").replaceAll("\\", "/");
}

function run() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error("❌ dist/ not found. Run `bun run build` first.");
    process.exit(1);
  }

  const htmlFiles = listHtmlFiles(DIST_DIR);
  check(htmlFiles.length > 0, "No HTML files found in dist/");

  const indexHtml = readDistFile("index.html");
  check(
    /<html lang="en"/.test(indexHtml),
    "index.html should have <html lang=\"en\">",
  );
  check(
    /<meta name="language" content="en"/.test(indexHtml),
    "index.html should have language meta `en`",
  );
  check(
    /<meta property="og:locale" content="en_US"/.test(indexHtml),
    "index.html should have og:locale `en_US`",
  );

  const idIndexHtml = readDistFile(path.join("id", "index.html"));
  check(
    /<html lang="id"/.test(idIndexHtml),
    "id/index.html should have <html lang=\"id\">",
  );
  check(
    /<meta name="language" content="id"/.test(idIndexHtml),
    "id/index.html should have language meta `id`",
  );
  check(
    /<meta property="og:locale" content="id_ID"/.test(idIndexHtml),
    "id/index.html should have og:locale `id_ID`",
  );

  const page404Html = readDistFile("404.html");
  check(
    /<meta name="robots" content="[^"]*noindex/.test(page404Html),
    "404.html should be noindex",
  );
  check(
    /<meta name="googlebot" content="[^"]*noindex/.test(page404Html),
    "404.html should set googlebot noindex",
  );
  check(!/hreflang="/.test(page404Html), "404.html should not emit hreflang");

  for (const absoluteFilePath of htmlFiles) {
    const filePath = normalizeFilePath(absoluteFilePath);
    const html = fs.readFileSync(absoluteFilePath, "utf8");

    const hreflangMatches = [
      ...html.matchAll(
        /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g,
      ),
    ];

    if (hreflangMatches.length > 0) {
      const hreflangSet = new Set(hreflangMatches.map((match) => match[1]));
      check(hreflangSet.has("en"), `${filePath} should include hreflang=en`);
      check(hreflangSet.has("id"), `${filePath} should include hreflang=id`);
      check(
        hreflangSet.has("x-default"),
        `${filePath} should include hreflang=x-default`,
      );

      for (const [, hreflang, href] of hreflangMatches) {
        const targetPath = resolveDistPathFromHref(href);
        check(
          targetPath !== null && fs.existsSync(targetPath),
          `${filePath} has missing hreflang target (${hreflang}): ${href}`,
        );
      }
    }

    const jsonLdMatches = [
      ...html.matchAll(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
      ),
    ];

    for (const [, payload] of jsonLdMatches) {
      let parsed;
      try {
        parsed = JSON.parse(payload);
      } catch {
        check(false, `${filePath} has invalid JSON-LD payload`);
        continue;
      }

      const schemas = Array.isArray(parsed) ? parsed : [parsed];
      for (const schema of schemas) {
        if (!schema || typeof schema !== "object") {
          continue;
        }

        const urls = [];
        if (typeof schema.url === "string") {
          urls.push(schema.url);
        }
        if (
          schema.mainEntityOfPage &&
          typeof schema.mainEntityOfPage === "object" &&
          typeof schema.mainEntityOfPage["@id"] === "string"
        ) {
          urls.push(schema.mainEntityOfPage["@id"]);
        }

        for (const url of urls) {
          check(
            !/\/index(?:id|\.id)(?:\/|$)/.test(url),
            `${filePath} JSON-LD URL contains malformed index suffix: ${url}`,
          );
        }

        if (schema["@type"] === "SoftwareApplication" && schema.offers) {
          const offers = schema.offers;
          const price = offers?.price;
          const currency = offers?.priceCurrency;

          if (price !== undefined) {
            check(
              typeof price === "string" && /^\d+(\.\d+)?$/.test(price),
              `${filePath} SoftwareApplication price should be numeric string`,
            );
          }

          if (price !== undefined && currency !== undefined) {
            check(
              typeof currency === "string" && /^[A-Z]{3}$/.test(currency),
              `${filePath} SoftwareApplication currency should be ISO-4217`,
            );
          }
        }
      }
    }

    if (html.includes("\"@type\":\"BlogPosting\"")) {
      check(
        /<meta property="og:type" content="article"/.test(html),
        `${filePath} BlogPosting page should set og:type=article`,
      );
      check(
        /<meta property="article:published_time" content="[^"]+"/.test(html),
        `${filePath} BlogPosting page should set article:published_time`,
      );
      check(
        /<meta property="article:modified_time" content="[^"]+"/.test(html),
        `${filePath} BlogPosting page should set article:modified_time`,
      );
    }
  }

  if (result.errors.length > 0) {
    console.error(`❌ SEO verification failed (${result.errors.length} issues).`);
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`✅ SEO verification passed (${result.checks} checks).`);
}

run();
