---
title: "react-native-device-spec-info"
description: "Helper JS-only untuk mengklasifikasikan perangkat React Native sebagai low/mid/high berdasarkan RAM, display, dan OS."
date: "2026-02-06T15:57:26Z"
lastUpdated: "2026-09-08T14:33:27Z"
npmURL: "https://www.npmjs.com/package/react-native-device-spec-info"
repoURL: "https://github.com/Naandalist/react-native-device-spec-info"
version: "2.0.0"
license: "MIT"
keywords:
  [
    "react-native",
    "device",
    "specs",
    "specification",
    "performance",
    "optimization",
    "low-end",
    "mid-range",
    "high-end",
    "ram",
    "hardware",
    "info",
    "mobile",
  ]
lang: "id"
---

# react-native-device-spec-info

Helper JS-only untuk mengklasifikasikan perangkat React Native sebagai low / mid / high.

Menggunakan RAM, display, dan versi OS dari [`react-native-device-info`](https://github.com/react-native-device-info/react-native-device-info) plus `Dimensions` / `PixelRatio` dari React Native. Tanpa custom native module.

Ini adalah heuristik, bukan benchmark. Selalu uji di perangkat nyata.

**Peer dependency:** `react-native-device-info` `>= 10`.

## Fitur

- Klasifikasikan perangkat sebagai `low`, `mid`, atau `high`
- Skor dari RAM, display, dan versi OS
- API hook dan async (`useDeviceSpec`, `getDeviceSpec`)
- Bobot dan threshold yang bisa dikonfigurasi
- Berjalan di bare React Native dan Expo (tergantung `react-native-device-info`)
- Tidak perlu native rebuild untuk paket ini

## Instalasi

```bash
npm install react-native-device-spec-info react-native-device-info
```

## Penggunaan

```typescript
import { useDeviceSpec } from "react-native-device-spec-info";

function MyComponent() {
  const { spec, score, isLoading, error } = useDeviceSpec();

  if (isLoading) return <ActivityIndicator />;
  if (error || !spec) return <FallbackUI />;

  return (
    <View>
      <Text>
        {spec} ({score})
      </Text>
      {spec === "low" && <SimplifiedUI />}
      {spec === "mid" && <StandardUI />}
      {spec === "high" && <EnhancedUI />}
    </View>
  );
}
```

```typescript
import { getDeviceSpec } from "react-native-device-spec-info";

const { spec, score, details } = await getDeviceSpec();
```

### Konfigurasi threshold

```typescript
import { configureDeviceSpec } from "react-native-device-spec-info";

configureDeviceSpec({
  thresholds: { high: 75, mid: 45 },
  weights: { ram: 60, display: 25, os: 15 },
});
```

Default: bobot RAM 50 / display 30 / OS 20, threshold high 70 / mid 40.

## Cara kerja

| Faktor | Bobot | Kriteria |
| --- | --- | --- |
| RAM | 50% | Memori lebih tinggi skor lebih tinggi |
| Display | 30% | Densitas piksel + baseline ponsel |
| Versi OS | 20% | Android / iOS lebih baru skor lebih tinggi |

- Skor ≥70 → high
- Skor 40–69 → mid
- Skor &lt;40 → low

## Lisensi

MIT

Untuk detail lebih lanjut, kunjungi [repositori GitHub](https://github.com/Naandalist/react-native-device-spec-info).
