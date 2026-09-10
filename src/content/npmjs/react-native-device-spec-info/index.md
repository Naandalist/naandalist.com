---
title: "react-native-device-spec-info"
description: "JS-only helper to classify React Native devices as low/mid/high from RAM, display, and OS."
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
lang: "en"
---

# react-native-device-spec-info

JS-only helper to classify React Native devices as low / mid / high.

Uses RAM, display, and OS version from [`react-native-device-info`](https://github.com/react-native-device-info/react-native-device-info) plus React Native `Dimensions` / `PixelRatio`. No custom native module.

This is a heuristic, not a benchmark. Always test on real devices.

**Peer dependency:** `react-native-device-info` `>= 10`.

## Features

- Classify devices as `low`, `mid`, or `high`
- Score from RAM, display, and OS version
- Hook and async APIs (`useDeviceSpec`, `getDeviceSpec`)
- Configurable weights and thresholds
- Works in bare React Native and Expo (subject to `react-native-device-info`)
- No native rebuild required for this package

## Installation

```bash
npm install react-native-device-spec-info react-native-device-info
```

## Usage

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

### Configure thresholds

```typescript
import { configureDeviceSpec } from "react-native-device-spec-info";

configureDeviceSpec({
  thresholds: { high: 75, mid: 45 },
  weights: { ram: 60, display: 25, os: 15 },
});
```

Defaults: weights RAM 50 / display 30 / OS 20, thresholds high 70 / mid 40.

## How it works

| Factor | Weight | Criteria |
| --- | --- | --- |
| RAM | 50% | Higher memory scores higher |
| Display | 30% | Pixel density + phone baseline |
| OS version | 20% | Newer Android / iOS score higher |

- Score ≥70 → high
- Score 40–69 → mid
- Score &lt;40 → low

## License

MIT

For more details, please visit the [GitHub repository](https://github.com/Naandalist/react-native-device-spec-info).
