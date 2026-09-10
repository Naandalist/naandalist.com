---
title: "blobmascot"
description: "Interactive blob mascot for React apps. Shape, expression, and gaze update live on canvas."
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
lang: "en"
---

# blobmascot

Interactive blob mascot for React apps. Shape, expression, and gaze update live on canvas.

No sprites, no Lottie files, no asset pipeline. Shape, expression, motion, and gaze are independent axes that lerp on a canvas.

Live demo: [naandalist.github.io/blobmascot](https://naandalist.github.io/blobmascot/)

## Features

- Drop in `<BlobMascot />` plus a controller
- 12 morphable shapes (circle, pebble, squircle, capsule, triangle, cloud, droplet, flame, medal, acorn, jellyfish, clover)
- 12 expressions that reshape the eyes
- 13 motion states (idle/thinking loop; wink, alert, burst, and more as one-shots)
- Gaze follows the pointer by default, or drive `yaw` / `pitch` yourself
- Poke on click, or call `controller.poke()`
- Export stills as PNG or WebP
- TypeScript types for every public value

## Installation

```bash
npm install blobmascot
```

Peer dependencies: `react` and `react-dom` 18 or newer.

## Usage

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

### Reactions

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

`followCursor` is on by default. Turn it off when you want to aim the gaze yourself:

```tsx
<BlobMascot controller={mascot} size={240} followCursor={false} />
```

```ts
mascot.lookAt({ yaw: 20, pitch: -8 });
mascot.resetGaze();
```

## License

MIT

For more details, please visit the [GitHub repository](https://github.com/Naandalist/blobmascot).
