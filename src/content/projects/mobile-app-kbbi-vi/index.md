---
title: "KBBI App"
description: "Portfolio and blog build with astro."
date: "Nov 11 2025"
demoURL: "https://astro-sphere-demo.vercel.app"
repoURL: "https://github.com/markhorn-dev/astro-sphere"
imageUrl: "https://skyfall.dev/_astro/high-seas-monitor.DvG9h3_n_Z2ry7NV.webp"
techStack: ["Astro", "TypeScript", "Tailwind CSS", "SolidJS"]
---

A React Native application for Indonesian dictionary (Kamus Besar Bahasa Indonesia).

## Prerequisites

- Node.js >= 18
- Yarn 4.11.0
- React Native development environment ([Setup Guide](https://reactnative.dev/docs/set-up-your-environment))

## Installation

```sh
yarn install
```

### iOS Setup

```sh
bundle install
bundle exec pod install
```

## Development

```sh
# Start Metro bundler
yarn start

# Run on Android
yarn android

# Run on iOS
yarn ios
```

## Build

```sh
# Clean Android build
yarn clean

# Build APK
yarn build-apk

# Build AAB
yarn build-aab

# Test release build
yarn test-release
```

## Tech Stack

- React Native 0.80
- React Navigation
- Axios
- React Native Reanimated
- jail-monkey (Security)

## Security Features

- Jailbreak detection
- Debug mode detection
- Auto-exit on insecure devices (production only)
