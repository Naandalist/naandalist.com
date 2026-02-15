/**
 * Build Route Verification Script
 *
 * This script verifies that the dist/ folder contains all expected routes
 * and no malformed paths like /indexid/
 */

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultDistPath = path.join(__dirname, "../dist");

export function verifyRoutes(targetDistPath = defaultDistPath, logger = () => {}) {
  const result = {
    pass: 0,
    fail: 0,
    errors: [],
  };

  function checkPath(dirPath, relativePath = "") {
    try {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });

      files.forEach((file) => {
        const fullPath = path.join(dirPath, file.name);
        const relPath = relativePath ? `${relativePath}/${file.name}` : file.name;

        if (file.isDirectory()) {
          // Check for malformed paths
          if (relPath.includes("indexid")) {
            result.fail++;
            result.errors.push(`❌ Malformed path with /indexid/: /${relPath}/`);
          } else if (relPath.includes("index.id")) {
            result.fail++;
            result.errors.push(`❌ Malformed path with /index.id/: /${relPath}/`);
          }

          checkPath(fullPath, relPath);
        } else if (file.name === "index.html") {
          // Valid route - path should not contain indexid
          if (relPath.includes("indexid")) {
            result.fail++;
            result.errors.push(`❌ Route with /indexid/: /${relPath}`);
          } else if (relPath.includes("index.id")) {
            result.fail++;
            result.errors.push(`❌ Route with /index.id/: /${relPath}`);
          } else {
            result.pass++;
            // Only log posts and projects routes for clarity
            if (relPath.includes("posts/") || relPath.includes("projects/")) {
              logger(`✅ ${relPath}`);
            }
          }
        }
      });
    } catch (error) {
      result.fail++;
      result.errors.push(`Error reading directory ${dirPath}: ${error}`);
    }
  }

  if (!fs.existsSync(targetDistPath)) {
    result.fail++;
    result.errors.push("❌ dist/ not found. Run `bun run build` first.");
    return result;
  }

  checkPath(targetDistPath);
  return result;
}

function run() {
  const cliDistPath = process.env.VERIFY_ROUTES_DIST_PATH || defaultDistPath;
  const result = verifyRoutes(cliDistPath, (message) => {
    // eslint-disable-next-line no-console
    console.log(message);
  });

  if (result.fail > 0 || result.errors.length > 0) {
    console.error(`❌ Route verification failed (${result.fail} issue(s)).`);
    result.errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log(`✅ Route verification passed (${result.pass} routes checked).`);
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  run();
}
