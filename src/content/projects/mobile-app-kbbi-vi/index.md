---
title: "Kamus KBBI VI"
description: "A free, ad-free Indonesian dictionary with fuzzy search."
date: "2022-12-11"
lastUpdated: "2026-08-29"
featured: true
imageUrl: "@assets/images/thumbnail-kbbi-app.webp"
liveURL: "https://play.google.com/store/apps/details?id=com.naandalist.kamus_kbbi"
repoURL: "https://github.com/Naandalist/kbbi-app"
techStack: ["React Native", "TypeScript", "Hermes", "Python", "Fuzzy Search", "jsDelivr", "ProGuard/R8"]
category: "Books & Reference"
platforms: ["Android 5.0+"]
price: "Free & Ad-free"
keywords: ["KBBI VI", "Indonesian dictionary", "React Native", "Python scraper", "fuzzy search", "open data pipeline"]
lang: "en"
---

Kamus KBBI VI is a free, ad-free Indonesian dictionary I designed, built, released, and continue to maintain independently. It combines a modern React Native interface with a data pipeline I created from scratch to expose richer dictionary entries, including definitions, usage examples, derived words, and proverbs.

![Kamus KBBI VI app screenshot](@assets/images/thumbnail-kbbi-app.webp)

## Why I Built It

The official dictionary app worked, but its interface felt dated and did not present the level of detail I wanted from a language reference. Important context such as examples and proverbs was difficult to discover or absent from the primary experience.

I treated that limitation as both a product and engineering problem. A better interface alone was not enough; I first needed a complete, queryable dataset capable of supporting it.

## My Role

This is a solo hobby project. I owned the product direction, UI design, mobile implementation, data acquisition pipeline, search behavior, Android optimization, Play Store release, and ongoing maintenance. I also chose to keep the application free, without advertising or analytics SDKs.

## Building the Dataset from A to Z

The hardest part happened before the mobile interface could search anything. I first assembled the Indonesian word list alphabetically from A to Z. I then built Python automation to request and parse the detail page for each word from the official [KBBI website](https://kbbi.kemdikbud.go.id/).

The pipeline converts each entry into structured JSON and organizes the output by initial letter and word. This preserves richer fields such as meanings, usage examples, derived forms, categories, and proverbs instead of reducing an entry to a single definition.

The generated corpus is published in the open-source [KBBI Harvester CDN repository](https://github.com/Naandalist/kbbi-harvester-cdn). Dictionary content remains attributed to the Indonesian language authority; the application and pipeline are independent, unofficial interfaces around that source.

## Lightweight Data Delivery

Rather than embedding the entire generated corpus inside every app release, individual JSON entries are delivered through [jsDelivr](https://www.jsdelivr.com/) from the public GitHub dataset. The word list supports discovery, while detailed entry data is fetched only after the user selects a word.

This split keeps the application package smaller and allows the open corpus to evolve independently from the mobile binary. The trade-off is explicit: detailed lookups require a network connection to reach the CDN.

## Search Experience

The app combines direct filtering with fuzzy matching. Exact and prefix-like results remain easy to reach, while approximate matching helps users recover when spelling is incomplete or slightly incorrect.

I kept search behavior intentionally simple and predictable. Instead of inventing an unsupported performance number, the design focuses on reducing the candidate set quickly and loading only the selected word's detailed JSON.

## Mobile Architecture and Optimization

The client is built with [React Native CLI](https://reactnative.dev/) and [TypeScript](https://www.typescriptlang.org/). [Hermes](https://reactnative.dev/docs/hermes) provides the JavaScript runtime. On Android, [ProGuard and R8](https://developer.android.com/build/shrink-code) remove unused code and optimize the release build to reduce application size.

The project has no advertising or analytics SDK. Search terms and history are not persisted locally. Network traffic is limited to retrieving public dictionary data required for the lookup experience.

### Technology Responsibilities

| Technology | Responsibility |
| --- | --- |
| [Python](https://www.python.org/) | Automates A-to-Z word discovery, scrapes each official KBBI detail page, parses its content, and generates structured JSON. |
| [KBBI Harvester CDN](https://github.com/Naandalist/kbbi-harvester-cdn) | Stores the generated open corpus separately from the mobile client, organized by initial letter and word. |
| [jsDelivr](https://www.jsdelivr.com/) | Delivers individual dictionary JSON files from the public GitHub corpus without requiring a custom backend. |
| Fuzzy matching | Finds close candidates when a query is incomplete or slightly misspelled while retaining straightforward exact filtering. |
| [React Native CLI](https://reactnative.dev/) | Provides the native Android application foundation for search, discovery, and detailed dictionary views. |
| [TypeScript](https://www.typescriptlang.org/) | Adds type safety across UI components, search behavior, and dictionary data structures. |
| [Hermes](https://reactnative.dev/docs/hermes) | Provides the JavaScript runtime for the Android client. |
| [ProGuard and R8](https://developer.android.com/build/shrink-code) | Remove unused code and optimize the Android release binary to reduce application size. |

## Open Source and Maintenance

The mobile source is available in the [KBBI app repository](https://github.com/Naandalist/kbbi-app), while the generated dictionary corpus lives separately in the [harvester repository](https://github.com/Naandalist/kbbi-harvester-cdn). Separating client and data responsibilities keeps both projects easier to inspect and maintain.

The app launched on December 11, 2022 and remains actively maintained.

## Impact

Google Play publicly reports more than [10,000 downloads](https://play.google.com/store/apps/details?id=com.naandalist.kamus_kbbi). Users have also shared that the application helps them access richer Indonesian word information through a cleaner experience.

## Why It Matters

Kamus KBBI VI represents more than a mobile UI. I built the data acquisition pipeline, structured and distributed the corpus, designed fuzzy discovery, optimized the Android binary, and operated the resulting product over multiple years.
