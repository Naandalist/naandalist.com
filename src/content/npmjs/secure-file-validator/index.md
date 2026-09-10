---
title: "secure-file-validator"
description: "Secure file validation library with signature checking and content validation."
date: "2024-11-06T17:00:17Z"
lastUpdated: "2026-09-05T18:21:11Z"
featured: true
npmURL: "https://www.npmjs.com/package/secure-file-validator"
repoURL: "https://github.com/Naandalist/secure-file-validator"
version: "2.0.0"
license: "MIT"
keywords:
  [
    "file-validation",
    "security",
    "file-type",
    "mime-type",
    "signature-check",
    "file-security",
    "esm",
  ]
lang: "en"
---

# secure-file-validator

Zero-dependency Node.js helper for upload type checks: extension, size, magic numbers, plus a small PDF and SVG content policy.

Aligned with the file-type checking part of [OWASP Unrestricted File Upload](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload) and [CWE-434](https://cwe.mitre.org/data/definitions/434.html). Not an antivirus. Not a complete upload-security stack.

## Features

- Extension, size, and magic-number validation
- PDF name-token policy (including hex-escaped names and Flate streams)
- SVG policy for script, `javascript:`, event handlers, and risky embeds
- Path or buffer / `Uint8Array` input
- Stable result codes for branching in app code
- Zero dependencies (Node.js 14.16+, ESM)

## Installation

```bash
npm install secure-file-validator
```

## Usage

### Quick start

```javascript
import { validateFile } from "secure-file-validator";

const result = await validateFile("uploads/photo.jpg");

if (result.ok) {
  // result.code === "OK"
} else {
  // result.code === "INVALID_SIGNATURE" | "PDF_JAVASCRIPT" | ...
  console.error(result.code, result.message);
}
```

`result.status` still exists as a deprecated alias of `result.ok`.

### From an upload buffer

```javascript
import { validateFile, validateBytes } from "secure-file-validator";

const result = await validateFile(req.file.buffer, {
  filename: req.file.originalname, // or extension: ".png"
});

if (!result.ok) {
  throw new Error(result.code);
}

const sync = validateBytes(req.file.buffer, { extension: ".png" });
```

Buffer / `Uint8Array` input must include `filename` or `extension`. Size is checked with `byteLength`.

## Supported types

| Extension | Magic check |
| --- | --- |
| `.jpg` / `.jpeg` | `FF D8 FF` |
| `.png` | `89 50 4E 47` |
| `.gif` | `47 49 46 38` |
| `.pdf` | `%PDF` + `%%EOF`, then token policy |
| `.svg` | `<?xml` or `<svg`, then SVG policy |

Default size cap: 5MB (`options.maxSizeInBytes`).

## PDF policy

| Token | Default | `code` |
| --- | --- | --- |
| `/Metadata` | allow | `PDF_METADATA` |
| `/Annots` | allow | `PDF_ANNOTS` |
| `/OpenAction` | allow | `PDF_OPEN_ACTION` |
| `/JS`, `/JavaScript` | deny | `PDF_JAVASCRIPT` |
| `/Launch` | deny | `PDF_LAUNCH` |
| `/EmbeddedFile` | deny | `PDF_EMBEDDED_FILE` |
| `/XFA` | deny | `PDF_XFA` |
| `/RichMedia` | deny | `PDF_RICH_MEDIA` |

```javascript
const strict = await validateFile(pdfPath, {
  pdf: { allowOpenAction: false },
});

// Dangerous: turns the script check off
const trusted = await validateFile(pdfPath, {
  pdf: { allowJavaScript: true },
});
```

## SVG policy

Always denied: `<script>`, `javascript:`, event handlers (`onload=` …), `<!ENTITY`.

Denied by default, overridable with `options.svg`:

| Rule | Default | `code` |
| --- | --- | --- |
| `foreignObject` | deny | `SVG_FOREIGN_OBJECT` |
| `data:` URI | deny | `SVG_DATA_URI` |
| external `href` | deny | `SVG_EXTERNAL_HREF` |

```javascript
await validateFile(svgPath, {
  svg: { allowDataUri: true },
});
```

## Result shape

```javascript
{
  ok: false,
  status: false, // deprecated alias of ok
  code: "PDF_JAVASCRIPT",
  message: "Suspicious PDF name token detected: /JavaScript",
  details: { token: "JavaScript" }
}
```

## License

MIT

For more details, please visit the [GitHub repository](https://github.com/Naandalist/secure-file-validator).
