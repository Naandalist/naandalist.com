/**
 * Build Route Verification Script
 *
 * This script verifies that the dist/ folder contains all expected routes
 * and no malformed paths like /indexid/
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "../dist");

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
            console.log(`✅ ${relPath}`);
          }
        }
      }
    });
  } catch (error) {
    result.errors.push(`Error reading directory ${dirPath}: ${error}`);
  }
}

checkPath(distPath);
