---
title: "Airpaz: Flight & Hotel Booking"
description: "A travel app for booking flights and hotels across multiple markets."
date: "2025-04-01"
lastUpdated: "2026-08-29"
featured: true
imageUrl: "@assets/images/thumbnail-airpaz.webp"
liveURL: "https://play.google.com/store/apps/details?id=com.atnetwork.airpazdev&hl=en"
repoURL: ""
techStack:
  [
    "React Native",
    "TypeScript",
    "Redux Toolkit",
    "React Query",
    "Maestro",
    "Fastlane",
    "Sentry",
  ]
category: "Travel & Local"
platforms: ["iOS", "Android"]
price: "Free"
keywords:
  [
    "Airpaz",
    "React Native",
    "hotel booking",
    "progressive loading",
    "mobile testing",
    "release automation",
  ]
lang: "en"
---

Airpaz is a travel platform for booking flights and hotels across multiple markets. I worked as a Frontend Developer on its React Native mobile apps and React web application, contributing to a six-person frontend team that shared ownership across Android, iOS, and web.

![Airpaz app screenshot](@assets/images/thumbnail-airpaz.webp)

## My Role

I built and maintained customer-facing booking features from April 2025 to June 2026. My work covered product delivery, performance-oriented state management, automated testing, release tooling, and production issue investigation. I collaborated with five other frontend engineers, including our frontend lead.

## Challenge: Hotel Search Drop-off

Internal analytics showed that users frequently abandoned the hotel search flow while waiting for results. Hotel names and images were already available, but pricing data took longer to arrive. Holding the entire screen until every field was ready made the experience feel slower than it needed to be.

The flight search flow already contained a related progressive-loading pattern, but hotel search had different data and behavior. I adapted the idea rather than copying its implementation.

## Solution: Progressive Hotel Results

I changed hotel search to expose useful data as soon as it became available. Users could start reviewing hotel names, images, and core details while pricing continued to load progressively in the background through a polling-like flow.

I placed the orchestration and business rules inside [Redux Toolkit](https://redux-toolkit.js.org/) middleware. This kept timing, merging, and state transitions outside the presentation layer. The UI only consumed the latest ready state, making components easier to reason about and maintain.

Internal tracking showed improved user retention through the hotel search flow after the change. Exact figures remain private, but the direction confirmed that reducing perceived waiting time improved the booking experience.

## Architecture and Tooling

The mobile application uses [React Native](https://reactnative.dev/) and [TypeScript](https://www.typescriptlang.org/) across Android and iOS. [Redux Toolkit](https://redux-toolkit.js.org/) manages application state and progressive search orchestration, while [TanStack Query](https://tanstack.com/query/latest) supports server-state workflows.

For development and production diagnosis, the team used [Flipper](https://fbflipper.com/), [Rozenite](https://rozenite.dev/), an internal analytics tracker, and [Sentry](https://sentry.io/). The tracker recorded interaction events such as cancel and submit clicks, allowing us to reconstruct user journeys and analyze behavior. Together, these tools helped us inspect application behavior, trace user-flow problems, and investigate production issues.

### Technology Responsibilities

| Technology | Responsibility |
| --- | --- |
| [React Native](https://reactnative.dev/) | Provides the shared mobile foundation for the Android and iOS applications. |
| [TypeScript](https://www.typescriptlang.org/) | Adds type safety across UI components, application state, and booking data contracts. |
| [Redux Toolkit](https://redux-toolkit.js.org/) | Manages client state and runs progressive hotel-search orchestration through middleware. |
| [TanStack Query](https://tanstack.com/query/latest) | Handles server-state requests, caching, and synchronization with booking services. |
| [Flipper](https://fbflipper.com/) | Supports application, network, and native debugging during development. |
| [Rozenite](https://rozenite.dev/) | Extends React Native developer tooling for runtime inspection. |
| Internal analytics tracker | Records interaction events such as cancel and submit clicks for user-journey reconstruction, behavior analysis, and drop-off detection. |
| [Sentry](https://sentry.io/) | Captures production errors and supplies diagnostic context for incident investigation. |
| [Maestro](https://maestro.dev/) | Runs repeatable end-to-end checks for critical hotel and flight booking flows. |
| [Fastlane](https://fastlane.tools/) | Automates mobile build and release tasks. |
| [GitLab Runner](https://docs.gitlab.com/runner/) | Executes CI/CD jobs for the mobile delivery pipeline. |
| [Slack incoming webhooks](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/) | Delivers build-completion notifications without requiring engineers to watch the CI dashboard. |

## Protecting Critical Booking Flows

I introduced [Maestro](https://maestro.dev/) end-to-end coverage for critical hotel and flight booking journeys. I also created reusable mocks so important scenarios could run consistently without depending entirely on live services.

This automation gave the team repeatable checks around the flows carrying the most product risk and reduced reliance on manual verification alone.

## Release Automation

Mobile builds ran through [Fastlane](https://fastlane.tools/) and [GitLab Runner](https://docs.gitlab.com/runner/). Previously, team members had to keep checking the CI dashboard to learn whether a build had finished.

I built a Slack notification bot that reported build completion directly to the team. The change removed repetitive dashboard monitoring and made release status visible where engineering communication already happened.

## Product Scale

The [Google Play listing](https://play.google.com/store/apps/details?id=com.atnetwork.airpazdev&hl=en) publicly reports more than one million downloads and a rating above four stars. The product supports multiple markets, languages, airlines, currencies, and payment methods, so even focused frontend changes operate within a high-variation booking system.

## Why It Matters

This work connected frontend engineering with measurable product behavior. Progressive results reduced perceived waiting during hotel search, automated tests protected revenue-critical booking flows, and release notifications removed friction from the team's daily operations.
