---
title: "AIA eBenefits App"
description: "A mobile app for accessing employee benefits, eCards, clinics, and claims."
date: "2023-02-01"
lastUpdated: "2026-08-29"
featured: true
imageUrl: "@assets/images/thumbnail-ebenefits-app.webp"
liveURL: "https://apps.apple.com/id/app/aia-ebenefits-app/id1523776118"
repoURL: ""
techStack: ["React Native", "TypeScript", "Redux Saga", "Snyk", "Dynatrace", "Azure DevOps", "patch-package"]
category: "Medical"
platforms: ["iOS", "Android"]
price: "Free"
keywords: ["AIA eBenefits", "React Native upgrade", "mobile modernization", "dependency security", "race condition", "production debugging"]
lang: "en"
---

AIA eBenefits gives members of the AIA Employee Benefits Scheme in Singapore mobile access to insurance benefits, eCards, panel clinics, and claim services. I worked on the production Android and iOS application as a Senior Engineer / Analyst from February 2023 to April 2025.

![AIA eBenefits app screenshot](@assets/images/thumbnail-ebenefits-app.webp)

## My Role

I was part of a team of five engineers and two Business Analysts. One BA also acted as delivery lead, keeping Jira work aligned with the release schedule. My responsibilities covered application modernization, dependency security, production debugging, implementation, and technical documentation.

## Challenge: A Direct React Native Upgrade

The application still ran on [React Native](https://reactnative.dev/) 0.65. Aging native tooling and dependencies increased maintenance cost, security findings, and compatibility risk. I received sole ownership of the Jira task to move the production app directly to React Native 0.74.

Skipping multiple framework releases compressed years of breaking changes into one migration. The work affected Android build configuration, Gradle, iOS tooling, CocoaPods, deprecated APIs, native modules, and third-party package compatibility.

## Modernization Approach

I upgraded the framework and its direct and transitive dependencies, then worked through build failures platform by platform. Some packages did not yet support the target environment cleanly, so I used [patch-package](https://www.npmjs.com/package/patch-package) to keep small compatibility fixes explicit, reviewable, and reproducible across local development and CI.

The application used [Redux Saga](https://redux-saga.js.org/) for state and side-effect orchestration. Preserving existing business behavior mattered as much as getting Android and iOS to compile, so I treated every compatibility change as a potential product regression.

### Technology Responsibilities

| Technology | Responsibility |
| --- | --- |
| [React Native](https://reactnative.dev/) | Provides the shared Android and iOS application foundation that I upgraded directly from version 0.65 to 0.74. |
| [TypeScript](https://www.typescriptlang.org/) | Adds type safety across application logic, components, and data contracts during modernization. |
| [Redux Saga](https://redux-saga.js.org/) | Orchestrates application state and asynchronous side effects while preserving established business flows. |
| [Gradle](https://gradle.org/) | Manages the Android build configuration and native dependency compatibility affected by the framework upgrade. |
| [CocoaPods](https://cocoapods.org/) | Resolves and integrates iOS native dependencies throughout the migration. |
| [patch-package](https://www.npmjs.com/package/patch-package) | Keeps necessary third-party compatibility fixes explicit, reviewable, and reproducible in local and CI environments. |
| [Snyk](https://snyk.io/) | Identifies vulnerable dependency paths that I triaged and remediated through direct and transitive dependency upgrades. |
| [Dynatrace](https://www.dynatrace.com/) | Supplies production monitoring and diagnostic context for investigating customer-facing issues. |
| [Azure DevOps](https://azure.microsoft.com/en-us/products/devops) | Supports the application's continuous integration and delivery pipeline. |
| [Confluence](https://www.atlassian.com/software/confluence) | Stores design reviews, implementation context, and validation evidence before changes reach the main codebase. |

## Validation and Release

Unit tests protected known logic during the migration. The Business Analysts then performed manual regression testing across core journeys, edge cases, and platform-specific behavior to confirm that business rules had not changed.

The upgraded application completed validation and reached production successfully. The result moved the codebase from React Native 0.65 to 0.74 while keeping existing customer workflows intact.

## Dependency Security

[Snyk](https://snyk.io/) continuously identified risks within the JavaScript dependency graph. I triaged findings and remediated vulnerable paths by upgrading direct and transitive dependencies. Examples included:

- [`cross-spawn` ReDoS](https://security.snyk.io/vuln/SNYK-JS-CROSSSPAWN-8303230)
- [`micromatch` inefficient regular expression complexity](https://security.snyk.io/vuln/SNYK-JS-MICROMATCH-6838728)
- [`inflight` resource retention](https://security.snyk.io/vuln/SNYK-JS-INFLIGHT-6095116)

Not every advisory represented the same runtime exposure in a mobile application. The engineering task was to understand each dependency path, apply the available upgrade or dependency-chain remediation, and verify that the application still behaved correctly.

## Resolving an Intermittent Production Issue

One customer-facing issue appeared intermittently in production but could not be reproduced in staging. A conventional test-and-retry approach was not enough because the failure depended on user state, timing, and device context.

I collected the relevant analytics events, correlated the sequence with device information, and reconstructed the conditions around the failure. The evidence pointed to missing validation and a race condition. I added defensive validation and adjusted the execution flow so competing operations could no longer leave the application in an invalid state.

This investigation turned an inconsistent customer complaint into an evidence-backed fix despite the absence of a reliable staging reproduction.

## Observability and Engineering Governance

The team used [Dynatrace](https://www.dynatrace.com/) for production monitoring and [Azure DevOps](https://azure.microsoft.com/en-us/products/devops) for delivery infrastructure. Before merging a fix or feature into the main codebase, we documented its context, design, and validation in [Confluence](https://www.atlassian.com/software/confluence).

This design-review practice created an operational memory for the team. When a similar issue appeared later, engineers could trace earlier decisions, compare symptoms, and avoid repeating the same investigation from zero.

## Why It Matters

Insurance applications need stability, traceability, and careful change management. This work combined framework modernization, dependency remediation, regression discipline, and production forensics without changing established customer workflows.
