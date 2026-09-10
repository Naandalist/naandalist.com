---
title: "@naandalist/honocoroko"
description: "TypeScript library for transliterating text between Latin and Javanese script (Aksara Jawa/Hanacaraka)."
date: "2025-07-31T17:13:52Z"
lastUpdated: "2026-09-06T13:56:21Z"
featured: true
npmURL: "https://www.npmjs.com/package/@naandalist/honocoroko"
repoURL: "https://github.com/Naandalist/honocoroko"
version: "1.4.0"
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
  ]
lang: "en"
---

# @naandalist/honocoroko

A TypeScript library for transliterating text between Latin and [Javanese script (Aksara Jawa/Hanacaraka)](https://id.wikipedia.org/wiki/Hanacaraka).

> **Note:** This library changes writing systems (Latin ↔ Javanese script), not languages. It's transliteration, not translation.

## Features

- ✅ Universal Module Support - Works with both ESM (`import`) and CommonJS (`require`)
- ✅ Full support for basic Javanese consonants (Aksara Nglegena)
- ✅ Vowels and vowel marks (Sandhangan)
- ✅ Special consonants (Aksara Murda)
- ✅ Javanese numerals (0-9)
- ✅ Javanese punctuation
- ✅ Phonetic approximations for Latin letters not in Javanese (f, v, z, q, x)
- ✅ TypeScript support with full type definitions
- ✅ Zero dependencies - lightweight and secure

## Installation

```bash
npm install @naandalist/honocoroko
```

## Usage

### Import Methods

#### ESM (Modern) - Recommended

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

### Basic Examples

```typescript
toHonocoroko("hanacaraka"); // ꦲꦤꦕꦫꦏ
toHonocoroko("bisa"); // ꦧꦶꦱ
toHonocoroko("bakso"); // ꦧꦏ꧀ꦱꦺꦴ
toHonocoroko("wong"); // ꦮꦺꦴꦁ

fromHonocoroko("ꦧꦶꦱ"); // "bisa"
fromHonocoroko(toHonocoroko("wong")); // "wong"

transliterate("bisa", "toHonocoroko");
transliterate("ꦧꦶꦱ", "fromHonocoroko");
```

### TypeScript Projects

```typescript
import {
  toHonocoroko,
  fromHonocoroko,
  TransliterationDirection,
  TransliterationOptions,
} from "@naandalist/honocoroko";

const javanese: string = toHonocoroko("hanacaraka");
const latin: string = fromHonocoroko("ꦲꦤꦕꦫꦏ");

// With options - opt-in to convert special characters
const options: TransliterationOptions = { convertSpecialChars: true };
const result: string = toHonocoroko("sapa iki?", options);
```

## API

### `toHonocoroko(text: string, options?: TransliterationOptions): string`

Converts Latin text to Javanese script.

```typescript
const javanese = toHonocoroko("hanacaraka");
// Returns: ꦲꦤꦕꦫꦏ
```

### `fromHonocoroko(text: string, options?: TransliterationOptions): string`

Converts Javanese script back to Latin text.

```typescript
const latin = fromHonocoroko("ꦲꦤꦕꦫꦏ");
// Returns: hanacaraka
```

### `transliterate(text: string, direction: 'toHonocoroko' | 'fromHonocoroko', options?: TransliterationOptions): string`

Generic function that can transliterate in either direction.

```typescript
const result1 = transliterate("hanacaraka", "toHonocoroko");
const result2 = transliterate("ꦲꦤꦕꦫꦏ", "fromHonocoroko");
```

## Supported Characters

### Basic Consonants

- ha (ꦲ), na (ꦤ), ca (ꦕ), ra (ꦫ), ka (ꦏ)
- da (ꦢ), ta (ꦠ), sa (ꦱ), wa (ꦮ), la (ꦭ)
- pa (ꦥ), dha (ꦝ), ja (ꦗ), ya (ꦪ), nya (ꦚ)
- ma (ꦩ), ga (ꦒ), ba (ꦧ), tha (ꦛ), nga (ꦔ)

### Numbers

- 0-9 → ꧐-꧙

### Punctuation

- Comma (,) → ꧈
- Period (.) → ꧉
- Colon (:) → ꧇

### Phonetic Approximations

- f → ꦥ꦳ (pa + cecak telu)
- v → ꦮ꦳ (wa + cecak telu)
- z → ꦗ꦳ (ja + cecak telu)
- q → ꦏ (ka)
- x → ꦏ꧀ꦱ (ks)

## Font Support

This package includes the HanacarakaFont.ttf in the `/fonts` directory for proper display of Javanese script.

## Credits

This library is inspired by the [transliterasijawa](https://github.com/bennylin/transliterasijawa) project.

## License

MIT © [Listiananda Apriliawan](https://www.naandalist.com/)

For more details, please visit the [GitHub repository](https://github.com/Naandalist/honocoroko).
