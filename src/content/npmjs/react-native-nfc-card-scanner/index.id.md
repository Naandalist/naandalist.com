---
title: "react-native-nfc-card-scanner"
description: "Pembaca kartu kredit & debit kontakless EMV untuk React Native untuk mengekstrak PAN dan tanggal kedaluwarsa lewat NFC di lingkungan terkontrol (Android, dukungan iOS terbatas)."
date: "2026-02-13T19:28:09Z"
lastUpdated: "2026-09-10T00:04:46Z"
npmURL: "https://www.npmjs.com/package/react-native-nfc-card-scanner"
repoURL: "https://github.com/Naandalist/react-native-nfc-card-scanner"
version: "1.1.0"
license: "MIT"
keywords:
  [
    "react-native",
    "nfc",
    "card-scanner",
    "card-reader",
    "payment-card",
    "emv",
    "emv-reader",
    "contactless",
    "iso-dep",
    "iso7816",
    "iso14443",
    "tlv",
    "android",
  ]
lang: "id"
---

# react-native-nfc-card-scanner

Pembaca kartu kredit & debit kontakless EMV untuk React Native. Mengekstrak PAN dan tanggal kedaluwarsa lewat NFC di lingkungan terkontrol, tergantung kebijakan penerbit kartu dan dukungan perangkat.

> **Catatan platform:** Android adalah jalur yang didukung. Apple Core NFC tidak mendukung AID terkait pembayaran, jadi membaca PAN kartu bank di iPhone umumnya diblokir.

Dibangun di atas [`react-native-nfc-manager`](https://github.com/revtel/react-native-nfc-manager).

## Fitur

- Baca kartu pembayaran kontakless EMV lewat NFC
- Ekstrak nomor kartu (PAN) dan tanggal kedaluwarsa
- Deteksi skema kartu otomatis dari AID
- Parser EMV TLV bawaan
- Mendukung template respons EMV flat (`70`) dan nested (`77`)
- Dukungan TypeScript dengan definisi tipe lengkap

## Skema kartu yang didukung

| Scheme | AID prefix |
| --- | --- |
| Visa | `A000000003` |
| Mastercard | `A000000004` |
| JCB | `A000000065` |
| American Express | `A000000025` |
| UnionPay | `A000000333` |
| Discover / Diners Club | `A000000152`, `A000000324`, `A000000444` |

## Instalasi

```bash
npm install react-native-nfc-card-scanner react-native-nfc-manager
```

`react-native-nfc-manager` adalah peer dependency wajib. Paket ini tidak bisa jalan di Expo Go; gunakan dev client / prebuild.

## Penggunaan

```typescript
import {
  scanNfc,
  stopNfc,
  isNfcSupported,
  isNfcEnabled,
} from "react-native-nfc-card-scanner";

async function handleScanCard() {
  try {
    const supported = await isNfcSupported();
    if (!supported) return;

    const enabled = await isNfcEnabled();
    if (!enabled) return;

    const result = await scanNfc();
    console.log("Nomor Kartu:", result.pan);
    console.log("PAN Masked:", result.maskedPan);
    console.log("Tanggal Kedaluwarsa:", result.exp);
    console.log("Skema Kartu:", result.scheme);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Scan NFC gagal:", error.message);
    }
  }
}

function handleCancel() {
  stopNfc();
}
```

## Keterbatasan

- Tidak semua kartu mengekspos data PAN yang bisa dibaca
- Beberapa penerbit mengembalikan nilai masked atau parsial
- iOS tidak bisa andal membaca PAN kartu pembayaran
- Hasil bergantung pada wilayah dan konfigurasi kartu

## Lisensi

MIT

Untuk detail lebih lanjut, kunjungi [repositori GitHub](https://github.com/Naandalist/react-native-nfc-card-scanner).
