---
title: "blobmascot"
description: "Maskot blob interaktif untuk aplikasi React. Bentuk, ekspresi, dan arah pandang diperbarui live di canvas."
date: "2026-09-10T07:39:58Z"
lastUpdated: "2026-09-10T09:28:20Z"
featured: true
npmURL: "https://www.npmjs.com/package/blobmascot"
repoURL: "https://github.com/Naandalist/blobmascot"
version: "0.2.0"
license: "MIT"
keywords:
  [
    "react",
    "mascot",
    "blob",
    "avatar",
    "animation",
    "procedural",
    "morphing",
    "expression",
    "gaze",
    "virtual-assistant",
    "gamification",
    "onboarding",
  ]
lang: "id"
---

# blobmascot

Maskot blob interaktif untuk aplikasi React. Bentuk, ekspresi, dan arah pandang diperbarui live di canvas.

Tanpa sprite, tanpa file Lottie, tanpa asset pipeline. Bentuk, ekspresi, motion, dan gaze adalah sumbu independen yang diinterpolasi di canvas.

Demo langsung: [naandalist.github.io/blobmascot](https://naandalist.github.io/blobmascot/)

## Fitur

- Langsung pakai `<BlobMascot />` plus controller
- 12 bentuk yang bisa morph (circle, pebble, squircle, capsule, triangle, cloud, droplet, flame, medal, acorn, jellyfish, clover)
- 12 ekspresi yang membentuk ulang mata
- 13 state motion (idle/thinking berulang; wink, alert, burst, dan lainnya sebagai one-shot)
- Gaze mengikuti pointer secara default, atau kendalikan `yaw` / `pitch` sendiri
- Poke lewat klik, atau panggil `controller.poke()`
- Ekspor still sebagai PNG atau WebP
- Tipe TypeScript untuk setiap nilai publik

## Instalasi

```bash
npm install blobmascot
```

Peer dependency: `react` dan `react-dom` 18 atau lebih baru.

## Penggunaan

```tsx
import { BlobMascot, useBlobMascot } from "blobmascot";

export function App() {
  const mascot = useBlobMascot({
    shape: "droplet",
    expression: "curious",
    state: "idle",
    color: "#111111",
  });

  return <BlobMascot controller={mascot} size={240} />;
}
```

### Reaksi

```ts
mascot.setExpression("surprised");
mascot.setState("alert");

mascot.setExpression("happy");
mascot.setState("idle");
```

### Morph

```ts
mascot.setShape("clover");
mascot.setExpression("proud");
mascot.setColor("#4B8FEA");
```

### Gaze

`followCursor` aktif secara default. Matikan jika ingin mengarahkan gaze sendiri:

```tsx
<BlobMascot controller={mascot} size={240} followCursor={false} />
```

```ts
mascot.lookAt({ yaw: 20, pitch: -8 });
mascot.resetGaze();
```

## Lisensi

MIT

Untuk detail lebih lanjut, kunjungi [repositori GitHub](https://github.com/Naandalist/blobmascot).
