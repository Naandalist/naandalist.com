---
title: "@naandalist/honocoroko"
description: "Library TypeScript untuk transliterasi teks antara huruf Latin dan aksara Jawa (Aksara Jawa/Hanacaraka)."
date: "2025-10-01"
lastUpdated: "2025-10-15"
npmURL: "https://www.npmjs.com/package/@naandalist/honocoroko"
repoURL: "https://github.com/Naandalist/honocoroko"
version: "1.2.1"
license: "MIT"
keywords:
  [
    "javanese",
    "hanacaraka",
    "honocoroko",
    "aksara-jawa",
    "transliteration",
    "indonesia",
    "jawa",
    "typescript",
  ]
lang: "id"
---

# @naandalist/honocoroko

Library TypeScript untuk transliterasi teks antara huruf Latin dan [aksara Jawa (Aksara Jawa/Hanacaraka)](https://id.wikipedia.org/wiki/Hanacaraka).

> **Catatan:** Library ini mengubah sistem penulisan (Latin ↔ aksara Jawa), bukan bahasa. Ini adalah transliterasi, bukan terjemahan.

## Fitur

- ✅ Dukungan Modul Universal - Bekerja dengan ESM (`import`) dan CommonJS (`require`)
- ✅ Dukungan penuh untuk konsonan dasar Jawa (Aksara Nglegena)
- ✅ Vokal dan tanda vokal (Sandhangan)
- ✅ Konsonan khusus (Aksara Murda)
- ✅ Angka Jawa (0-9)
- ✅ Tanda baca Jawa
- ✅ Pendekatan fonetik untuk huruf Latin yang tidak ada di aksara Jawa (f, v, z, q, x)
- ✅ Dukungan TypeScript dengan definisi tipe lengkap
- ✅ Tanpa dependensi - ringan dan aman

## Instalasi

```bash
npm install @naandalist/honocoroko
```

## Penggunaan

### Metode Import

#### ESM (Modern) - Direkomendasikan

```typescript
import {
  toHonocoroko,
  fromHonocoroko,
  transliterate,
} from "@naandalist/honocoroko";
```

#### CommonJS (Legacy)

```javascript
const {
  toHonocoroko,
  fromHonocoroko,
  transliterate,
} = require("@naandalist/honocoroko");
```

### Contoh Dasar

```typescript
// Konversi teks Latin ke aksara Jawa
const javanese = toHonocoroko("hanacaraka");
console.log(javanese); // ꦲꦤꦕꦫꦏ

// Konversi aksara Jawa kembali ke Latin
const latin = fromHonocoroko("ꦲꦤꦕꦫꦏ");
console.log(latin); // hanacaraka

// Menggunakan fungsi transliterate generik
const result1 = transliterate("hanacaraka", "toHonocoroko");
const result2 = transliterate("ꦲꦤꦕꦫꦏ", "fromHonocoroko");
```

### Proyek TypeScript

```typescript
import {
  toHonocoroko,
  fromHonocoroko,
  TransliterationDirection,
  TransliterationOptions,
} from "@naandalist/honocoroko";

const javanese: string = toHonocoroko("hanacaraka");
const latin: string = fromHonocoroko("ꦲꦤꦕꦫꦏ");

// Dengan opsi - aktifkan konversi karakter khusus
const options: TransliterationOptions = { convertSpecialChars: true };
const result: string = toHonocoroko("sapa iki?", options);
```

## API

### `toHonocoroko(text: string, options?: TransliterationOptions): string`

Mengkonversi teks Latin ke aksara Jawa.

```typescript
const javanese = toHonocoroko("hanacaraka");
// Mengembalikan: ꦲꦤꦕꦫꦏ
```

### `fromHonocoroko(text: string, options?: TransliterationOptions): string`

Mengkonversi aksara Jawa kembali ke teks Latin.

```typescript
const latin = fromHonocoroko("ꦲꦤꦕꦫꦏ");
// Mengembalikan: hanacaraka
```

### `transliterate(text: string, direction: 'toHonocoroko' | 'fromHonocoroko', options?: TransliterationOptions): string`

Fungsi generik yang dapat melakukan transliterasi ke dua arah.

```typescript
const result1 = transliterate("hanacaraka", "toHonocoroko");
const result2 = transliterate("ꦲꦤꦕꦫꦏ", "fromHonocoroko");
```

## Karakter yang Didukung

### Konsonan Dasar

- ha (ꦲ), na (ꦤ), ca (ꦕ), ra (ꦫ), ka (ꦏ)
- da (ꦢ), ta (ꦠ), sa (ꦱ), wa (ꦮ), la (ꦭ)
- pa (ꦥ), dha (ꦝ), ja (ꦗ), ya (ꦪ), nya (ꦚ)
- ma (ꦩ), ga (ꦒ), ba (ꦧ), tha (ꦛ), nga (ꦔ)

### Angka

- 0-9 → ꧐-꧙

### Tanda Baca

- Koma (,) → ꧈
- Titik (.) → ꧉
- Titik dua (:) → ꧇

### Pendekatan Fonetik

- f → ꦥ꦳ (pa + cecak telu)
- v → ꦮ꦳ (wa + cecak telu)
- z → ꦗ꦳ (ja + cecak telu)
- q → ꦏ (ka)
- x → ꦏ꧀ꦱ (ks)

## Dukungan Font

Paket ini menyertakan HanacarakaFont.ttf di direktori `/fonts` untuk tampilan aksara Jawa yang tepat.

## Kredit

Library ini terinspirasi dari proyek [transliterasijawa](https://github.com/bennylin/transliterasijawa).

## Lisensi

MIT © [Listiananda Apriliawan](https://www.naandalist.com/)

Untuk detail lebih lanjut, silakan kunjungi [repositori GitHub](https://github.com/Naandalist/honocoroko).
