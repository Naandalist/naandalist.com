---
title: "react-native-nfc-card-scanner"
description: "EMV contactless credit & debit card reader for React Native to extract PAN and expiry via NFC in controlled environments (Android, limited iOS support)."
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
lang: "en"
---

# react-native-nfc-card-scanner

EMV contactless credit & debit card reader for React Native. Extracts PAN and expiry via NFC in controlled environments, depending on card issuer policies and device support.

> **Platform note:** Android is the supported path. Apple Core NFC does not support payment-related AIDs, so reading a bank-card PAN on iPhone is generally blocked.

Built on top of [`react-native-nfc-manager`](https://github.com/revtel/react-native-nfc-manager).

## Features

- Read EMV contactless payment cards via NFC
- Extract card number (PAN) and expiration date
- Auto-detect card scheme from AID
- Built-in EMV TLV parser
- Supports flat (`70`) and nested (`77`) EMV response templates
- TypeScript support with full type definitions

## Supported card schemes

| Scheme | AID prefix |
| --- | --- |
| Visa | `A000000003` |
| Mastercard | `A000000004` |
| JCB | `A000000065` |
| American Express | `A000000025` |
| UnionPay | `A000000333` |
| Discover / Diners Club | `A000000152`, `A000000324`, `A000000444` |

## Installation

```bash
npm install react-native-nfc-card-scanner react-native-nfc-manager
```

`react-native-nfc-manager` is a required peer dependency. This package cannot run in Expo Go; use a dev client / prebuild app.

## Usage

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
    console.log("Card Number:", result.pan);
    console.log("Masked PAN:", result.maskedPan);
    console.log("Expiry Date:", result.exp);
    console.log("Card Scheme:", result.scheme);
  } catch (error) {
    if (error instanceof Error) {
      console.error("NFC scan failed:", error.message);
    }
  }
}

function handleCancel() {
  stopNfc();
}
```

## Limitations

- Not all cards expose readable PAN data
- Some issuers return masked or partial values
- iOS cannot reliably read payment-card PANs
- Results depend on region and card configuration

## License

MIT

For more details, please visit the [GitHub repository](https://github.com/Naandalist/react-native-nfc-card-scanner).
