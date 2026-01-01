---
title: "@naandalist/patch-package"
description: "Fork patch-package dengan peningkatan keamanan yang memperbaiki kerentanan sambil mempertahankan kompatibilitas penuh."
date: "2025-10-01"
lastUpdated: "2025-10-15"
npmURL: "https://www.npmjs.com/package/@naandalist/patch-package"
repoURL: "https://github.com/naandalist/patch-package"
version: "8.1.6"
license: "MIT"
keywords:
  [
    "patch",
    "package",
    "module",
    "node_modules",
    "npm",
    "yarn",
    "fix",
    "dependency",
    "fork",
    "hotfix",
    "monkeypatch",
    "security",
    "maintenance",
  ]
lang: "id"
---

# @naandalist/patch-package

Paket ini adalah versi fork dari [patch-package v8.0.0](https://www.npmjs.com/package/patch-package) resmi. Tujuan utamanya adalah memperbaiki kerentanan keamanan (MEDIUM dan HIGH SEVERITY) sambil mempertahankan kompatibilitas penuh dengan paket asli.

## Peningkatan Keamanan

Fork ini memperbaiki semua kerentanan keamanan yang diidentifikasi oleh Snyk:

| #   | Kerentanan                                           | Paket       | Tingkat | Referensi                  |
| --- | ---------------------------------------------------- | ----------- | ------- | -------------------------- |
| 1   | Regular Expression Denial of Service (ReDoS)         | cross-spawn | High    | SNYK-JS-CROSSSPAWN-8303230 |
| 2   | Inefficient Regular Expression Complexity            | micromatch  | High    | SNYK-JS-MICROMATCH-6838728 |
| 3   | Missing Release of Resource after Effective Lifetime | inflight    | Medium  | SNYK-JS-INFLIGHT-6095116   |

## Instalasi

```bash
# Menggunakan npm
npm install @naandalist/patch-package

# Menggunakan yarn
yarn add @naandalist/patch-package
```

## Penggunaan

Penggunaan tetap identik dengan patch-package asli, mempertahankan kompatibilitas penuh sambil memberikan keamanan yang ditingkatkan.

### Membuat Patch

1. Buat perubahan pada file paket di folder `node_modules`
2. Jalankan perintah berikut:

```bash
# Menggunakan yarn
yarn patch-package nama-paket

# Menggunakan npm
npx patch-package nama-paket
```

### Menerapkan Patch

Patch diterapkan secara otomatis ketika Anda menjalankan:

```bash
yarn install
# atau
npm install
```

Untuk instruksi penggunaan detail dan fitur lanjutan, silakan lihat [dokumentasi patch-package asli](https://www.npmjs.com/package/patch-package).

## Mengapa Menggunakan Fork Ini?

- ✅ Semua fungsionalitas asli dipertahankan
- 🛡️ Kerentanan keamanan temuan Snyk diperbaiki
- 💪 Pemeliharaan keamanan rutin

## Kontribusi

Kontribusi sangat diterima! Silakan ajukan Pull Request.

## Lisensi

MIT - Lihat [LICENSE](https://github.com/naandalist/patch-package/blob/main/LICENSE) untuk detail.

Untuk detail lebih lanjut, silakan kunjungi [repositori GitHub](https://github.com/naandalist/patch-package).
