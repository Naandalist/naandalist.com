---
title: "secure-file-validator"
description: "Library validasi file yang aman untuk Node.js yang melakukan pengecekan signature dan validasi konten untuk melindungi aplikasi dari unggahan file berbahaya."
date: "2025-10-01"
lastUpdated: "2025-10-15"
npmURL: "https://www.npmjs.com/package/secure-file-validator"
repoURL: "https://github.com/Naandalist/secure-file-validator"
version: "1.1.0"
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
    "typescript",
  ]
lang: "id"
---

# secure-file-validator

Library validasi file yang aman untuk Node.js yang melakukan pengecekan signature dan validasi konten. Library ini melindungi aplikasi dari unggahan file berbahaya dengan memvalidasi tipe file, memeriksa signature file, dan memindai pola mencurigakan.

Library ini dibangun mengikuti panduan keamanan standar industri:

- [OWASP Unrestricted File Upload Prevention](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload)
- [CWE-434: Unrestricted Upload of File with Dangerous Type](https://cwe.mitre.org/data/definitions/434.html)
- [NIST Security Guidelines for File Uploads](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf)

## Fitur

- Validasi signature file yang aman
- Pemindaian pola konten untuk kode berbahaya
- Dukungan untuk berbagai tipe file (JPEG, PNG, GIF, PDF, SVG)
- Pemeriksaan keamanan bawaan untuk file PDF dan SVG
- Fitur whitelist untuk menangani deteksi false positive
- Tanpa dependensi
- Validasi ukuran file yang dapat dikustomisasi

## Instalasi

```bash
npm install secure-file-validator
```

## Penggunaan

### Penggunaan Dasar (Batas default 5MB)

```typescript
import { validateFile } from "secure-file-validator";

try {
  const result = await validateFile("path/ke/file/anda.pdf");

  if (result.status) {
    console.log("File valid:", result.message);
  } else {
    console.log("Validasi file gagal:", result.message);
  }
} catch (error) {
  console.error("Error:", error);
}
```

### Batas Ukuran File Kustom

```typescript
import { validateFile } from "secure-file-validator";

// Contoh: Set batas 10MB
const TEN_MB = 10 * 1024 * 1024;

try {
  const result = await validateFile("path/ke/file/anda.pdf", {
    maxSizeInBytes: TEN_MB,
  });

  if (result.status) {
    console.log("File valid:", result.message);
  } else {
    console.log("Validasi file gagal:", result.message);
  }
} catch (error) {
  console.error("Error:", error);
}
```

### Whitelist PDF untuk Penanganan False Positive

Library ini menyertakan pemeriksaan keamanan untuk pola PDF yang berpotensi berbahaya. Namun, beberapa PDF yang sah mungkin mengandung pola seperti `/Metadata/`, `/OpenAction/`, atau `/JS/` yang ditandai sebagai mencurigakan. Anda dapat menggunakan opsi `pdfWhitelist` untuk mengizinkan pola tertentu:

```typescript
import { validateFile } from "secure-file-validator";

const result = await validateFile("path/ke/file.pdf", {
  pdfWhitelist: ["Metadata", "OpenAction", "JS"],
});

if (result.status) {
  console.log("File valid:", result.message);
} else {
  console.log("Validasi file gagal:", result.message);
}
```

Pola PDF yang tersedia untuk whitelist:

- `Metadata` - Metadata PDF (umumnya ditemukan di PDF yang sah)
- `OpenAction` - Aksi otomatis saat PDF dibuka
- `JS` - Singkatan JavaScript
- `JavaScript` - Kode JavaScript
- `Launch` - Aksi launch
- `EmbeddedFile` - File yang disematkan
- `XFA` - XML Forms Architecture
- `Annots` - Anotasi

> **Catatan:** Hanya whitelist pola yang Anda percayai. Whitelist pola mengurangi pemeriksaan keamanan dan harus dilakukan dengan hati-hati berdasarkan kasus penggunaan spesifik Anda.

## Tipe File yang Didukung

| Kategori      | Tipe File |
| ------------- | --------- |
| Gambar        | JPEG/JPG  |
| Gambar        | PNG       |
| Gambar        | GIF       |
| Dokumen       | PDF       |
| Grafis Vektor | SVG       |

## Referensi API

### `validateFile(filePath, options)`

Fungsi validasi utama yang melakukan semua pemeriksaan.

| Parameter              | Tipe     | Deskripsi                         | Default  |
| ---------------------- | -------- | --------------------------------- | -------- |
| filePath               | string   | Path ke file yang akan divalidasi | required |
| options                | Object   | Opsi konfigurasi                  | {}       |
| options.maxSizeInBytes | number   | Ukuran file maksimum dalam bytes  | 5MB      |
| options.pdfWhitelist   | string[] | Array pola PDF untuk whitelist    | []       |

**Mengembalikan:** `Promise<{ status: boolean, message: string }>`

### `validateFileContent(filePath, options)`

Melakukan validasi khusus konten.

| Parameter            | Tipe     | Deskripsi                         | Default  |
| -------------------- | -------- | --------------------------------- | -------- |
| filePath             | string   | Path ke file yang akan divalidasi | required |
| options              | Object   | Opsi konfigurasi                  | {}       |
| options.pdfWhitelist | string[] | Array pola PDF untuk whitelist    | []       |

**Mengembalikan:** `Promise<{ status: boolean, message: string }>`

### `checkFileSignature(buffer, signatures)`

Memeriksa buffer file terhadap signature yang diketahui.

| Parameter  | Tipe                 | Deskripsi                       |
| ---------- | -------------------- | ------------------------------- |
| buffer     | Buffer               | Buffer file untuk diperiksa     |
| signatures | Array<Array<number>> | Signature valid untuk diperiksa |

**Mengembalikan:** `boolean`

## Contoh Hasil

```typescript
// Validasi berhasil
{
  status: true,
  message: "Content validation passed"
}

// Validasi gagal (ukuran file)
{
  status: false,
  message: "File size exceeds limit of 5MB"
}

// Validasi gagal (tipe file tidak valid)
{
  status: false,
  message: "Invalid file extension"
}

// Validasi gagal (konten berbahaya)
{
  status: false,
  message: "Suspicious pattern detected: /<script/i"
}
```

## Keterbatasan

- Hanya mendukung tipe file yang ditentukan
- Tidak ada dukungan pemrosesan stream
- Konten file binary tidak dianalisis secara mendalam
- Pencocokan pola dilakukan pada representasi string file

## Kontribusi

Kontribusi sangat diterima! Silakan ajukan Pull Request. Untuk perubahan besar, silakan buka issue terlebih dahulu untuk mendiskusikan apa yang ingin Anda ubah.

## Lisensi

MIT

Untuk detail lebih lanjut, silakan kunjungi [repositori GitHub](https://github.com/Naandalist/secure-file-validator).
