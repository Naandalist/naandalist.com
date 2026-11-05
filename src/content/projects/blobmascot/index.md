---
name: 'blobmascot'
description: 'Interactive blob mascot for React apps. Shape, expression, and gaze update live on canvas.'
tags: ['Open Source']
type: ['Open Source']
asset: '/static/projects/blobmascot.webp'
fallback: '/static/projects/blobmascot.webp'
link: 'https://www.npmjs.com/package/blobmascot'
github: 'https://github.com/Naandalist/blobmascot'
date: 'September 2026'
updated: 2026-09-10
techStack: ['React', 'TypeScript']
category: 'npm package'
price: 'Free, MIT'
---

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
