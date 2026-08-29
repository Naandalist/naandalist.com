---
title: "Info Haji"
description: "A solo open-source React Native app that surfaces complete official Hajj data through a clearer experience while keeping pilgrim information on-device."
date: "2025-11-09"
lastUpdated: "2026-08-29"
featured: true
imageUrl: "@assets/images/thumbnail-infohaji-app.webp"
liveURL: "https://play.google.com/store/apps/details?id=com.naandalist.info_haji"
repoURL: "https://github.com/Naandalist/info-hajj-app"
techStack: ["React Native", "TypeScript", "Redux Toolkit", "RTK Query", "React Navigation", "Jest", "Hermes"]
category: "Books & Reference"
platforms: ["Android 5.0+"]
price: "Free & Open Source"
keywords: ["Info Haji", "React Native", "Hajj information", "Kemenag API", "open source", "privacy"]
lang: "en"
---

Info Haji is an independent hobby project I designed, built, released, and maintained by myself. It helps Indonesian Hajj pilgrims and their families check portion details, departure estimates, payment status, queue information, quotas, and related news from one mobile interface.

![Info Haji app screenshot](@assets/images/thumbnail-infohaji-app.webp)

## Why I Built It

The official application already provided access to Hajj information, but I found its interface difficult to use. While inspecting its network responses with [HTTP Toolkit](https://httptoolkit.com/), I also discovered that the API returned useful fields that the application did not display.

That gap became the product idea: use the available official data more completely and present it through a clearer, focused experience. Info Haji was not intended to replace the underlying government service. It is an alternative client for making that information easier to understand.

## My Role

I owned the entire project: product direction, interface design, React Native implementation, data modeling, privacy decisions, testing, Play Store release, open-source repository, and maintenance. There was no separate designer, backend engineer, or QA team.

## Architecture

The app uses [React Native CLI](https://reactnative.dev/) 0.79.2 and [TypeScript](https://www.typescriptlang.org/). [Redux Toolkit](https://redux-toolkit.js.org/) manages application state, while [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) handles API requests and caching. [React Navigation](https://reactnavigation.org/) provides the navigation structure, and [Hermes](https://reactnative.dev/docs/hermes) powers the JavaScript runtime.

Info Haji has no custom backend or database. The mobile application connects directly to official [Ministry of Religious Affairs Hajj services](https://haji.kemenag.go.id/) for pilgrim and Hajj data. Related articles come from [NU Online](https://www.nu.or.id/).

This direct architecture kept the hobby project small and removed an unnecessary data-processing layer that I would otherwise need to operate and secure.

### Technology Responsibilities

| Technology | Responsibility |
| --- | --- |
| [React Native CLI](https://reactnative.dev/) | Provides the native Android application foundation that I designed, implemented, and released independently. |
| [TypeScript](https://www.typescriptlang.org/) | Adds type safety across UI components, application state, and the broad Hajj API response model. |
| [Redux Toolkit](https://redux-toolkit.js.org/) | Manages client-side application state and keeps state transitions predictable across lookup flows. |
| [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) | Handles direct requests to the Kemenag services, response transformation, caching, and loading or error states. |
| [React Navigation](https://reactnavigation.org/) | Organizes navigation between lookup, result, reference, and news screens. |
| [Hermes](https://reactnative.dev/docs/hermes) | Runs the application's JavaScript bundle on Android. |
| [Kemenag Hajj services](https://haji.kemenag.go.id/) | Supply the official pilgrim, queue, departure, payment, and Hajj operational data consumed directly by the app. |
| [NU Online](https://www.nu.or.id/) | Supplies related Hajj news displayed alongside the official service data. |
| [HTTP Toolkit](https://httptoolkit.com/) | Helped me inspect network responses and identify useful API fields omitted from the official app interface. |
| [JailMonkey](https://github.com/GantMan/jail-monkey) | Detects rooted devices as one layer of protection around personal pilgrim information. |
| [Jest](https://jestjs.io/) | Verifies application logic and reduces regressions in data-processing behavior. |

## Turning Complete Responses into Useful Information

The main engineering problem was not collecting more data. The API already returned it. The challenge was modeling a broad response and turning previously hidden fields into screens that remained understandable for pilgrims and their families.

The app surfaces portion identity, queue position, Gregorian and Hijri departure estimates, provincial quota, payment stages, reserve or istitha'ah status, BPIH information, embarkation details, flight schedules, group assignments, and hotel information when available.

Keeping the data layer inside RTK Query gave each screen a consistent loading, success, and error model. It also separated API response handling from presentation so the UI could focus on hierarchy and readability.

## Privacy on a Personal Device

Portion lookups can return personal pilgrim information. Info Haji stores lookup data on the user's device for convenience, but I do not operate a server that receives or collects it. The [Google Play data-safety declaration](https://play.google.com/store/apps/details?id=com.naandalist.info_haji) reports no data collection and no data sharing with third parties.

I added root detection with [JailMonkey](https://github.com/GantMan/jail-monkey) and screen-capture protection to reduce casual exposure on compromised or shared devices. These controls add privacy friction; they are not presented as guarantees against a determined attacker.

## Quality and Open Source

[Jest](https://jestjs.io/) covers application logic, while linting and TypeScript checks support day-to-day code quality. The complete source is available in the [public GitHub repository](https://github.com/Naandalist/info-hajj-app), making the implementation and technical decisions inspectable.

The application is no longer actively maintained. The repository remains available as a record of the product and engineering work.

## Impact

Google Play publicly reports more than [1,000 downloads](https://play.google.com/store/apps/details?id=com.naandalist.info_haji). For a solo hobby project without a dedicated growth or marketing team, that adoption validated the usefulness of presenting official Hajj information through a more complete interface.

## Why It Matters

Info Haji shows how I approach an imperfect product experience: inspect the underlying system, identify information being left unused, design a clearer interface, and ship the complete product independently.
