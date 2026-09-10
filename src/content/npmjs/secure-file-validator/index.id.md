---
title: "secure-file-validator"
description: "Library validasi file yang aman dengan pengecekan signature dan validasi konten."
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
lang: "id"
---

# secure-file-validator

Helper Node.js tanpa dependency untuk pengecekan tipe unggahan: ekstensi, ukuran, magic number, plus kebijakan konten PDF dan SVG yang ringkas.

Selaras dengan bagian pengecekan tipe file dari [OWASP Unrestricted File Upload](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload) dan [CWE-434](https://cwe.mitre.org/data/definitions/434.html). Bukan antivirus. Bukan stack keamanan unggahan yang lengkap.

## Fitur

- Validasi ekstensi, ukuran, dan magic number
- Kebijakan token nama PDF (termasuk nama hex-escaped dan Flate stream)
- Kebijakan SVG untuk script, `javascript:`, event handler, dan embed berisiko
- Input path atau buffer / `Uint8Array`
- Kode hasil yang stabil untuk branching di aplikasi
- Tanpa dependency (Node.js 14.16+, ESM)

## Instalasi

```bash
npm install secure-file-validator
```

## Penggunaan

### Mulai cepat

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

`result.status` masih ada sebagai alias deprecated dari `result.ok`.

### Dari buffer unggahan

```javascript
import { validateFile, validateBytes } from "secure-file-validator";

const result = await validateFile(req.file.buffer, {
  filename: req.file.originalname, // atau extension: ".png"
});

if (!result.ok) {
  throw new Error(result.code);
}

const sync = validateBytes(req.file.buffer, { extension: ".png" });
```

Input buffer / `Uint8Array` wajib menyertakan `filename` atau `extension`. Ukuran dicek lewat `byteLength`.

## Tipe yang didukung

| Extension | Magic check |
| --- | --- |
| `.jpg` / `.jpeg` | `FF D8 FF` |
| `.png` | `89 50 4E 47` |
| `.gif` | `47 49 46 38` |
| `.pdf` | `%PDF` + `%%EOF`, lalu kebijakan token |
| `.svg` | `<?xml` atau `<svg`, lalu kebijakan SVG |

Batas ukuran default: 5MB (`options.maxSizeInBytes`).

## Kebijakan PDF

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

// Berbahaya: mematikan pengecekan script
const trusted = await validateFile(pdfPath, {
  pdf: { allowJavaScript: true },
});
```

## Kebijakan SVG

Selalu ditolak: `<script>`, `javascript:`, event handler (`onload=` …), `<!ENTITY`.

Ditolak secara default, bisa diubah lewat `options.svg`:

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

## Bentuk hasil

```javascript
{
  ok: false,
  status: false, // alias deprecated dari ok
  code: "PDF_JAVASCRIPT",
  message: "Suspicious PDF name token detected: /JavaScript",
  details: { token: "JavaScript" }
}
```

## Lisensi

MIT

Untuk detail lebih lanjut, kunjungi [repositori GitHub](https://github.com/Naandalist/secure-file-validator).
